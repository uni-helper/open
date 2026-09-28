import { beforeEach, describe, expect, it, vi } from 'vitest'
import { logger, openDevtools } from '../../../open/src/index'
import { isSupportedPlatform, runOpenCommand } from '../../src/commands/open'

vi.mock('../../../open/src/index', () => {
  return {
    logger: {
      error: vi.fn(),
      info: vi.fn(),
      log: vi.fn(),
    },
    MP_PLATFORMS: {
      'mp-weixin': '微信',
      'mp-alipay': '支付宝',
    },
    openDevtools: vi.fn(async () => true),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('isSupportedPlatform', () => {
  it('checks platform support', () => {
    expect(isSupportedPlatform('mp-weixin')).toBe(true)
    expect(isSupportedPlatform('mp-alipay')).toBe(true)
    expect(isSupportedPlatform('mp-unknown')).toBe(false)
    expect(isSupportedPlatform('h5')).toBe(false)
  })
})

describe('runOpenCommand', () => {
  it('defaults to mp-weixin platform and returns 0 on success', async () => {
    const code = await runOpenCommand('dist/dev/mp-weixin')

    expect(code).toBe(0)
    expect(openDevtools).toHaveBeenCalledWith('mp-weixin', 'dist/dev/mp-weixin', {})
  })

  it('returns 1 when opening fails', async () => {
    vi.mocked(openDevtools).mockResolvedValueOnce(false)

    const code = await runOpenCommand('dist/dev/mp-weixin')

    expect(code).toBe(1)
  })

  it('rejects unsupported platforms without opening devtools', async () => {
    const code = await runOpenCommand('dist', { platform: 'mp-unknown' })

    expect(code).toBe(1)
    expect(openDevtools).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalled()
  })

  it('passes custom cli path scoped to the platform', async () => {
    const code = await runOpenCommand('dist', {
      platform: 'mp-alipay',
      cliPath: '/custom/alipay/cli',
    })

    expect(code).toBe(0)
    expect(openDevtools).toHaveBeenCalledWith('mp-alipay', 'dist', {
      cliPath: { 'mp-alipay': '/custom/alipay/cli' },
    })
  })
})
