import type { Plugin } from 'vite'
import type { VitePluginOpenOptions } from '../src/index'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { openDevtools } from '../../open/src/index'
import { OpenDevtools } from '../src/index'

vi.mock('../../open/src/index', () => {
  return {
    openDevtools: vi.fn(async () => true),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

function createMockConfig(overrides: Partial<{ root: string, outDir: string }> = {}) {
  const { root = '/project', outDir = 'dist/dev/mp-weixin' } = overrides
  return {
    root,
    build: { outDir },
  }
}

/**
 * 以 vite 兼容的方式调用插件钩子（钩子可能是函数或 { handler } 对象）
 */
function invokeHook(hook: unknown, thisArg: unknown, ...args: unknown[]): unknown {
  const handler = typeof hook === 'function'
    ? hook as (...a: unknown[]) => unknown
    : (hook as { handler?: (...a: unknown[]) => unknown } | undefined)?.handler
  return handler?.apply(thisArg, args)
}

function collectPlugins(options: VitePluginOpenOptions, config: ReturnType<typeof createMockConfig>): Plugin {
  const plugin = OpenDevtools(options)
  invokeHook(plugin.configResolved, plugin, config)
  return plugin
}

async function runCloseBundle(plugin: Plugin) {
  await invokeHook(plugin.closeBundle, plugin)
}

describe('open devtools plugin', () => {
  it('declares plugin metadata', () => {
    const plugin = OpenDevtools()

    expect(plugin.name).toBe('uni-helper:vite-plugin-open')
    expect(plugin.enforce).toBe('post')
    expect(plugin.closeBundle).toBeDefined()
  })

  it('opens devtools after build using vite build.outDir by default', async () => {
    const plugin = collectPlugins({}, createMockConfig())

    await runCloseBundle(plugin)

    expect(openDevtools).toHaveBeenCalledWith('mp-weixin', '/project/dist/dev/mp-weixin', { cliPath: undefined })
  })

  it('respects custom platform and projectPath', async () => {
    const plugin = collectPlugins(
      { platform: 'mp-alipay', projectPath: 'custom/out' },
      createMockConfig({ root: '/app' }),
    )

    await runCloseBundle(plugin)

    expect(openDevtools).toHaveBeenCalledWith('mp-alipay', '/app/custom/out', { cliPath: undefined })
  })

  it('opens only once in watch mode by default', async () => {
    const plugin = collectPlugins({}, createMockConfig())

    await runCloseBundle(plugin)
    await runCloseBundle(plugin)

    expect(openDevtools).toHaveBeenCalledTimes(1)
  })

  it('opens on every build when once is false', async () => {
    const plugin = collectPlugins({ once: false }, createMockConfig())

    await runCloseBundle(plugin)
    await runCloseBundle(plugin)

    expect(openDevtools).toHaveBeenCalledTimes(2)
  })

  it('does nothing when open is false', async () => {
    const plugin = collectPlugins({ open: false }, createMockConfig())

    await runCloseBundle(plugin)

    expect(openDevtools).not.toHaveBeenCalled()
  })

  it('passes custom cliPath through to the launcher', async () => {
    const cliPath = { 'mp-weixin': '/custom/cli' }
    const plugin = collectPlugins({ cliPath }, createMockConfig())

    await runCloseBundle(plugin)

    expect(openDevtools).toHaveBeenCalledWith('mp-weixin', '/project/dist/dev/mp-weixin', { cliPath })
  })
})
