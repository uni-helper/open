---
name: unh-open
description: 使用 @uni-helper/open（命令 unhopen）自动打开小程序开发者工具，支持 CLI、Vite 插件、SDK 三种接入方式（当前已实现微信平台）。当用户在 uni-app 或其他小程序项目中提到打开微信开发者工具、编译/构建后自动打开、在开发者工具里预览产物、unhopen、@uni-helper/open、cliPath、服务端口、touristappid，或反馈"开发者工具打不开/没弹出来"等问题时使用。
---

# unh-open — 自动打开小程序开发者工具

`@uni-helper/open` 在编译产物就绪后自动拉起对应平台的小程序开发者工具，省去"打开工具 → 导入项目 → 选目录"的手动步骤。只发布一个包，按子路径提供三种用法：

| 入口 | 用途 |
| --- | --- |
| `@uni-helper/open` | SDK，程序化调用 |
| `@uni-helper/open/vite` | Vite 插件，构建完成后自动打开 |
| `@uni-helper/open/cli` | CLI（命令 `unhopen`），也支持程序化调用 |

安装：`pnpm i -D @uni-helper/open`（SDK 与 Vite 插件需要安装；只是临时用 CLI 时可 `npx @uni-helper/open` 免装运行）。

## 最重要的前提

微信开发者工具必须开启服务端口，否则 CLI 调用会失败（退出码非 0）：

> 开发者工具 → 设置 → 安全设置 → 开启服务端口

macOS 上首次通过命令行打开时，工具内可能弹出授权确认，需要用户手动允许。

## 选择接入方式

| 场景 | 用法 |
| --- | --- |
| 一次性从命令行打开编译产物 | CLI（下方第一节） |
| uni-app / Vite 项目，构建完成后自动打开 | Vite 插件 |
| 在 Node 脚本、自研工具链或其他库中集成 | SDK |

## CLI

```bash
# projectPath 是编译产物目录（含 project.config.json 的那个），缺省为当前目录
npx @uni-helper/open dist/dev/mp-weixin

# 指定平台与自定义 CLI 路径
npx @uni-helper/open dist/dev/mp-weixin --platform mp-weixin --cli-path /path/to/cli

# 列出支持的平台
npx @uni-helper/open list
```

选项：`-p, --platform <platform>`（默认 `mp-weixin`）、`-c, --cli-path <path>`（覆盖自动检测的 CLI 路径）。退出码 `0` 成功、`1` 失败，可用于脚本判断。

程序化调用（返回进程退出码）：

```ts
import { runOpenCommand } from '@uni-helper/open/cli'

await runOpenCommand('dist/dev/mp-weixin', { platform: 'mp-weixin' })
```

## Vite 插件

uni-app 项目的典型接入（在构建产物写入后，即 `closeBundle` 钩子触发）：

```ts
import uni from '@dcloudio/vite-plugin-uni'
// vite.config.ts
import { OpenDevtools } from '@uni-helper/open/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    uni(),
    OpenDevtools({ platform: 'mp-weixin' }),
  ],
})
```

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `platform` | `'mp-weixin'` | 小程序平台 |
| `projectPath` | vite 的 `build.outDir` | 编译产物目录，相对项目根解析 |
| `open` | `true` | 是否自动打开 |
| `cliPath` | — | 自定义 CLI 路径，格式同 SDK |
| `once` | `true` | watch 模式下仅在首次构建后打开；设为 `false` 则每次重新编译都打开 |

## SDK

快捷方式，返回 `Promise<boolean>` 表示是否成功：

```ts
import { openDevtools } from '@uni-helper/open'

await openDevtools('mp-weixin', 'dist/dev/mp-weixin', {
  cliPath: {
    'mp-weixin': '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
  },
})
```

`cliPath` 按平台配置，值为字符串，或区分操作系统的对象：

```ts
cliPath: {
  'mp-weixin': {
    mac: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
    windows: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
  },
}
```

需要更细粒度控制（自定义处理器注册、复用启动器）时使用 `MPDevtoolsLauncher`：

```ts
import { MPDevtoolsLauncher, WechatDevtoolsHandler } from '@uni-helper/open'

const launcher = new MPDevtoolsLauncher({
  cliPath: { 'mp-weixin': '/path/to/cli' },
})

launcher.registerHandler(new WechatDevtoolsHandler())
await launcher.open('mp-weixin', 'dist/dev/mp-weixin')
```

在自己的项目中为其他平台扩展处理器（实现 `DevtoolsHandler` 并注册）见 [references/extending.md](references/extending.md)。

## 平台支持

支持的平台标识（与 `unhopen list` 输出一致）：`mp-weixin`（微信）、`mp-alipay`（支付宝）、`mp-baidu`（百度）、`mp-toutiao`（字节跳动）、`mp-qq`（QQ）、`mp-xhs`（小红书）、`mp-harmony`（鸿蒙）、`mp-jd`（京东）、`mp-kuaishou`（快手）、`mp-lark`（飞书）。

**当前只有 `mp-weixin` 实现了启动处理器**。传入其余平台会提示"暂不支持"并返回 `false`，不会报错崩溃。用户提到其他平台时，说明该平台尚未内置：可在自己的项目中实现自定义处理器（见 references/extending.md），或向仓库提 PR 合入通用处理器。

## 启动流程（排查时按此对照）

以微信为例，`openDevtools` 内部依次执行：

1. **检测安装位置**：macOS 查找 `/Applications/wechatwebdevtools.app` 与 `~/Applications/wechatwebdevtools.app`；Windows 查询注册表卸载项和 AppCompatFlags 中的"微信开发者工具"。
2. **确定 CLI 路径**：优先用配置的 `cliPath`；否则拼接检测结果——macOS 为 `<安装目录>/Contents/MacOS/cli`，Windows 为 `<安装目录>\cli.bat`。检测不到则报"未安装或无法检测到"并返回 `false`。
3. **补齐项目文件**：编译产物目录缺少 `project.config.json` 时自动创建（内容为 `appid: "touristappid"`、`projectname: "empty"`）；已存在则**不会**覆盖。
4. **启动**：执行 `cli open --project <编译产物目录>`（projectPath 会先解析为绝对路径）。
5. 退出码 `0` 视为成功；非 0 时提示检查服务端口是否开启。

## 排错速查

| 现象 | 处理 |
| --- | --- |
| 提示"打开失败，退出码非 0" | 最常见原因：服务端口未开启。设置 → 安全设置 → 开启服务端口 |
| 提示"开发者工具未安装或无法检测到" | 工具装在非默认位置时，用 `cliPath` 显式指定 |
| 工具弹了但项目不对 | 确认传入的是**编译产物目录**（如 `dist/dev/mp-weixin`），不是源码目录；uni-app 的 dev 产物在 `dist/dev/<platform>`，build 产物在 `dist/build/<platform>` |
| watch 模式每次改代码都弹工具 | 这是 `once: true` 之外的行为（配置成了 `false`）；改回默认即可 |
| 不存在 `project.config.json` 的目录也能打开 | 正常，第 3 步会自动创建游客配置 |
