<a href="https://uni-helper.cn/open"><img src="./banner.svg" alt="banner" width="100%"/></a>

<a href="https://github.com/uni-helper/open/stargazers"><img src="https://img.shields.io/github/stars/uni-helper/open?colorA=005947&colorB=eee&style=for-the-badge" alt="GitHub Stars"></a>
<a href="https://www.npmjs.com/package/@uni-helper/open"><img src="https://img.shields.io/npm/dm/@uni-helper/open?colorA=005947&colorB=eee&style=for-the-badge" alt="npm downloads"></a>
<a href="https://www.npmjs.com/package/@uni-helper/open"><img src="https://img.shields.io/npm/v/@uni-helper/open?colorA=005947&colorB=eee&style=for-the-badge" alt="npm version"></a>
<br/>

自动打开小程序开发者工具。只发布一个包 `@uni-helper/open`，通过子路径提供三种使用方式：

| 入口 | 说明 |
| --- | --- |
| `@uni-helper/open` | SDK，供其他项目集成调用 |
| `@uni-helper/open/vite` | Vite 插件，构建完成后自动打开 |
| `@uni-helper/open/cli` | CLI（命令行使用安装后执行 `unhopen`，也可程序化调用） |

## Skill

本仓库的 npm 包内置了面向 AI 编程助手的技能包（[skills/unh-open](./skills/unh-open/SKILL.md)），与包版本一起更新，并将 [skills-npm](https://github.com/antfu/skills-npm) 声明为 peer dependency（npm 7+ 与 pnpm 安装本包时会自动带上）。安装本包后，运行一次即可让 AI 编程助手（ZCode、Claude Code、Cursor 等）使用：

```bash
npx skills-npm
```

它会扫描依赖中内置的技能并链接给对应的助手，配合 `npx skills-npm setup` 可在项目里持久化（写入 `prepare` 脚本，安装依赖后自动同步）。

也可以不依赖 npm，直接从 GitHub 安装：`npx skills add uni-helper/open --skill unh-open`。

## CLI

```bash
npx @uni-helper/open [projectPath]

# 指定平台与自定义 CLI 路径
npx @uni-helper/open dist/dev/mp-weixin --platform mp-weixin --cli-path /path/to/cli

# 列出支持的平台
npx @uni-helper/open list
```

程序化调用：

```ts
import { runOpenCommand } from '@uni-helper/open/cli'

// 返回进程退出码
await runOpenCommand('dist/dev/mp-weixin', { platform: 'mp-weixin' })
```

## SDK

```bash
pnpm i @uni-helper/open
```

```ts
import { openDevtools } from '@uni-helper/open'

await openDevtools('mp-weixin', 'dist/dev/mp-weixin')
```

需要更细粒度控制时，可以使用 `MPDevtoolsLauncher`：

```ts
import { MPDevtoolsLauncher, WechatDevtoolsHandler } from '@uni-helper/open'

const launcher = new MPDevtoolsLauncher({
  cliPath: { 'mp-weixin': '/path/to/cli' },
})

// 注册平台处理器，也可以实现 DevtoolsHandler 接口扩展其他平台
launcher.registerHandler(new WechatDevtoolsHandler())

await launcher.open('mp-weixin', 'dist/dev/mp-weixin')
```

## Vite 插件

```bash
pnpm i -D @uni-helper/open
```

```ts
// vite.config.ts
import { OpenDevtools } from '@uni-helper/open/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    OpenDevtools({ platform: 'mp-weixin' }),
  ],
})
```

默认在构建产物写入后（`closeBundle` 钩子）打开开发者工具，项目路径取 vite 的 `build.outDir`；watch 模式下仅在首次构建后打开，可通过 `once: false` 关闭该行为。

## 仓库结构

代码按 monorepo 组织（便于维护），构建时统一由根目录 tsdown 打包为单个 `@uni-helper/open` 包发布（`dist/index.mjs`、`dist/vite.mjs`、`dist/cli.mjs`、`dist/bin.mjs`）：

- `packages/core` — SDK 原语：启动器、类型、跨平台查找工具
- `packages/handlers` — 平台处理器（目前支持微信，可按平台扩展）
- `packages/open` — SDK 门面：聚合 core 与 handlers，发布包主入口
- `packages/cli` — CLI
- `packages/vite-plugin` — Vite 插件

## License

[MIT](./LICENSE)

## 🙇🏻‍♂️[赞助](https://afdian.com/a/flippedround)

<p align="center">
  <a href="https://afdian.com/a/flippedround">
    <img alt="sponsors" src="https://cdn.jsdelivr.net/gh/FliPPeDround/sponsors/sponsorkit/sponsors.svg"/>
  </a>
</p>
