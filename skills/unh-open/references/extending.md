# 扩展其他平台的小程序开发者工具处理器

`MPDevtoolsLauncher` 通过 `DevtoolsHandler` 接口实现平台插件化。要支持尚未内置的平台（如支付宝、字节跳动），在**你自己的项目里**实现该接口并注册到启动器即可。当用户要求为某个小程序平台添加支持、或问"怎么接入 xx 平台"时读这个文件。

`@uni-helper/open` 主入口导出了实现所需的全部类型与工具函数：`DevtoolsHandler`、`PlatformSpecificString`、`MPPlatform`、`findSoftwareInstallLocation`（按名称在 macOS /Applications、~/Applications 与 Windows 注册表中查找安装目录）、`buildDevtoolsCliPath`（拼接安装目录与后缀）。

## DevtoolsHandler 接口

```ts
interface DevtoolsHandler {
  /** 支持的小程序平台，如 'mp-alipay' */
  platform: MPPlatform
  /** CLI 路径后缀，区分操作系统 */
  cliPathSuffix: PlatformSpecificString // { mac: string, windows: string }
  /** 开发者工具名称，用于自动检测安装位置 */
  devtoolsName: PlatformSpecificString
  /** 可选；注册到启动器时会被启动器自身的配置覆盖 */
  config?: DevtoolsConfig
  /** 检测开发者工具是否安装 */
  detect: () => Promise<boolean>
  /** 获取开发者工具 CLI 路径；无自定义路径且检测失败时返回 null */
  getCliPath: () => Promise<string | null>
  /** 完整的启动逻辑（命令构建 + 执行），成功返回 true */
  launch: (projectPath: string) => Promise<boolean>
}
```

相关类型：

```ts
type CliPathConfig = string | { mac: string, windows: string }

interface DevtoolsConfig {
  open?: boolean // 是否自动打开，默认 false（Vite 插件层默认 true）
  cliPath?: Partial<Record<MPPlatform, CliPathConfig>>
}
```

路径解析优先级（内置微信处理器的行为，自定义处理器建议保持一致）：`config.cliPath[platform]` → 安装位置 + `cliPathSuffix`。macOS 走 `mac` 值，Windows 走 `windows` 值。

## 实现步骤

1. 确认目标平台 CLI 的真实行为：多数小程序开发者工具提供 `cli open --project <路径>` 形态的命令（如微信）。先查该平台官方文档确认命令与参数。
2. 实现处理器。骨架（以支付宝为例，需按该平台实际情况调整）：

```ts
import type { DevtoolsHandler, PlatformSpecificString } from '@uni-helper/open'
import process from 'node:process'
import { buildDevtoolsCliPath, findSoftwareInstallLocation } from '@uni-helper/open'
import spawn from 'cross-spawn'
import { isMacOS } from 'std-env'

export class AlipayDevtoolsHandler implements DevtoolsHandler {
  platform = 'mp-alipay' as const

  cliPathSuffix: PlatformSpecificString = {
    mac: 'Contents/MacOS/cli',
    windows: 'cli.bat',
  }

  devtoolsName: PlatformSpecificString = {
    windows: '小程序开发者工具',
    mac: '小程序开发助手', // 以该平台实际的 .app 名称和 Windows 程序名为准
  }

  private installPath: string | null = null

  async detect(): Promise<boolean> {
    if (this.installPath)
      return true
    this.installPath = findSoftwareInstallLocation(this.devtoolsName)
    return this.installPath !== null
  }

  async getCliPath(): Promise<string | null> {
    const custom = this.config?.cliPath?.[this.platform]
    if (typeof custom === 'string')
      return custom
    if (custom)
      return isMacOS ? custom.mac : custom.windows
    if (!this.installPath)
      await this.detect()
    return this.installPath ? buildDevtoolsCliPath(this.installPath, this.cliPathSuffix) : null
  }

  async launch(projectPath: string): Promise<boolean> {
    const cliPath = await this.getCliPath()
    if (!cliPath)
      return false
    // 参考 WechatDevtoolsHandler 的实现：cross-spawn 执行 `cli open --project <路径>`，
    // stdio: 'inherit'，监听 error / close 事件，非 0 退出码时给出可操作的错误提示
    return new Promise((resolve) => {
      const child = spawn(cliPath, ['open', '--project', projectPath], {
        stdio: 'inherit',
        cwd: process.cwd(),
      })
      child.on('error', (error) => {
        console.error(`支付宝小程序开发者工具打开失败: ${error.message}`)
        resolve(false)
      })
      child.on('close', (code) => {
        resolve(code === 0)
      })
    })
  }
}
```

3. 注册并使用：

```ts
import { MPDevtoolsLauncher } from '@uni-helper/open'

const launcher = new MPDevtoolsLauncher()
launcher.registerHandler(new AlipayDevtoolsHandler())
await launcher.open('mp-alipay', 'dist/dev/mp-alipay')
```

注意：内置的 `openDevtools()` 快捷方式只注册了微信处理器，自定义平台必须走 `MPDevtoolsLauncher`。

## 合入本仓库

如果你的处理器可以通用，欢迎向 [uni-helper/open](https://github.com/uni-helper/open) 提 PR：在 monorepo 的 `packages/handlers/src/` 下新增处理器（参考 `wechat.ts`），从 `index.ts` 导出，并加入 `packages/open/src/index.ts` 的 `createDefaultHandlers()`，同时在 `packages/handlers/test/` 补充与 `wechat-handler.test.ts` 同构的测试。合入后其他用户即可通过 `openDevtools()` 直接使用。
