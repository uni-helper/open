import { defineConfig } from 'tsdown'
import { StaleGuardRecorder } from 'tsdown-stale-guard'

// 单包发布：所有能力合并进根包 @uni-helper/open
// - index: SDK（packages/open 门面，聚合 core + handlers）
// - vite:  Vite 插件（packages/vite-plugin）
// - cli:   CLI 程序化调用（packages/cli）
// - bin:   uni-open 命令入口（packages/cli）
export default defineConfig({
  entry: {
    index: 'packages/open/src/index.ts',
    vite: 'packages/vite-plugin/src/index.ts',
    cli: 'packages/cli/src/index.ts',
    bin: 'packages/cli/src/bin.ts',
  },
  dts: true,
  publint: true,
  plugins: [
    StaleGuardRecorder(),
  ],
})
