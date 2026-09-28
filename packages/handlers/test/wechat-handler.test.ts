import process from 'node:process'
import { describe, expect, it } from 'vitest'
import { MPDevtoolsLauncher } from '../../core/src/index'
import { WechatDevtoolsHandler } from '../src/index'

describe('wechat devtools handler', () => {
  it('declares the weixin platform metadata', () => {
    const handler = new WechatDevtoolsHandler()

    expect(handler.platform).toBe('mp-weixin')
    expect(handler.cliPathSuffix).toEqual({ windows: 'cli.bat', mac: 'Contents/MacOS/cli' })
    expect(handler.devtoolsName).toEqual({ windows: '微信开发者工具', mac: 'wechatwebdevtools' })
  })

  it('prefers a custom string cli path from config', async () => {
    const handler = new WechatDevtoolsHandler()
    handler.config = { cliPath: { 'mp-weixin': '/custom/path/cli' } }

    expect(await handler.getCliPath()).toBe('/custom/path/cli')
  })

  it('resolves platform-specific custom cli path for the current OS', async () => {
    const handler = new WechatDevtoolsHandler()
    handler.config = {
      cliPath: {
        'mp-weixin': { mac: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli', windows: 'C:\\tools\\cli.bat' },
      },
    }

    const cliPath = await handler.getCliPath()

    if (process.platform === 'darwin') {
      expect(cliPath).toBe('/Applications/wechatwebdevtools.app/Contents/MacOS/cli')
    }
    else if (process.platform === 'win32') {
      expect(cliPath).toBe('C:\\tools\\cli.bat')
    }
  })

  it('inherits launcher config on registration', () => {
    const launcher = new MPDevtoolsLauncher({
      cliPath: { 'mp-weixin': '/custom/path/cli' },
    })
    const handler = new WechatDevtoolsHandler()

    launcher.registerHandler(handler)

    expect(handler.config).toEqual(launcher.getConfig())
    expect(handler.config?.cliPath?.['mp-weixin']).toBe('/custom/path/cli')
  })
})
