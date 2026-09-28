import type { DevtoolsConfig, DevtoolsHandler } from '../src/types'
import process from 'node:process'
import { resolve } from 'pathe'
import { describe, expect, it, vi } from 'vitest'
import { MPDevtoolsLauncher } from '../src/launcher'

function createFakeHandler(overrides: Partial<DevtoolsHandler> = {}): DevtoolsHandler {
  return {
    platform: 'mp-weixin',
    cliPathSuffix: { mac: 'cli', windows: 'cli.exe' },
    devtoolsName: { mac: 'fake-devtools', windows: 'fake-devtools' },
    config: {},
    detect: vi.fn(async () => true),
    getCliPath: vi.fn(async () => '/fake/cli'),
    launch: vi.fn(async () => true),
    ...overrides,
  } as DevtoolsHandler
}

describe('mp devtools launcher', () => {
  it('registers handlers and reports supported platforms', () => {
    const launcher = new MPDevtoolsLauncher()
    const wechat = createFakeHandler({ platform: 'mp-weixin' })
    const alipay = createFakeHandler({ platform: 'mp-alipay' })

    launcher.registerHandlers([wechat, alipay])

    expect(launcher.supports('mp-weixin')).toBe(true)
    expect(launcher.supports('mp-alipay')).toBe(true)
    expect(launcher.supports('mp-baidu')).toBe(false)
    expect(launcher.getSupportedPlatforms()).toEqual(['mp-weixin', 'mp-alipay'])
    expect(launcher.getHandler('mp-weixin')).toBe(wechat)
    expect(launcher.getHandler('mp-baidu')).toBeNull()
  })

  it('propagates its config into registered handlers', () => {
    const config: DevtoolsConfig = {
      cliPath: { 'mp-weixin': '/custom/cli' },
    }
    const launcher = new MPDevtoolsLauncher(config)
    const handler = createFakeHandler()

    launcher.registerHandler(handler)

    expect(handler.config).toBe(config)
    expect(launcher.getConfig()).toEqual(config)
    expect(launcher.getCustomCliPath('mp-weixin')).toBe('/custom/cli')
    expect(launcher.getCustomCliPath('mp-alipay')).toBeUndefined()
  })

  it('returns false for unsupported platform without invoking any handler', async () => {
    const launcher = new MPDevtoolsLauncher()
    const handler = createFakeHandler({ platform: 'mp-weixin' })
    launcher.registerHandler(handler)

    const result = await launcher.open('mp-baidu', 'dist')

    expect(result).toBe(false)
    expect(handler.detect).not.toHaveBeenCalled()
    expect(handler.launch).not.toHaveBeenCalled()
  })

  it('returns false when devtools is not installed', async () => {
    const launcher = new MPDevtoolsLauncher()
    const detect = vi.fn(async () => false)
    const launch = vi.fn(async () => true)
    launcher.registerHandler(createFakeHandler({ detect, launch }))

    const result = await launcher.open('mp-weixin', 'dist')

    expect(result).toBe(false)
    expect(detect).toHaveBeenCalledOnce()
    expect(launch).not.toHaveBeenCalled()
  })

  it('opens devtools with the resolved absolute project path', async () => {
    const launcher = new MPDevtoolsLauncher()
    const launch = vi.fn(async () => true)
    launcher.registerHandler(createFakeHandler({ launch }))

    const result = await launcher.open('mp-weixin', 'dist/dev/mp-weixin')

    expect(result).toBe(true)
    expect(launch).toHaveBeenCalledWith(resolve(process.cwd(), 'dist/dev/mp-weixin'))
  })

  it('returns false and swallows handler errors', async () => {
    const launcher = new MPDevtoolsLauncher()
    const detect = vi.fn(async () => {
      throw new Error('boom')
    })
    launcher.registerHandler(createFakeHandler({ detect }))

    const result = await launcher.open('mp-weixin', 'dist')

    expect(result).toBe(false)
  })

  it('returns false when launch fails', async () => {
    const launcher = new MPDevtoolsLauncher()
    launcher.registerHandler(createFakeHandler({ launch: vi.fn(async () => false) }))

    const result = await launcher.open('mp-weixin', 'dist')

    expect(result).toBe(false)
  })
})
