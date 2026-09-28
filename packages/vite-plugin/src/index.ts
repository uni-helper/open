import type { Plugin } from 'vite'
import type { DevtoolsConfig, MPPlatform } from '../../open/src/index'
import process from 'node:process'
import { resolve } from 'pathe'
import { openDevtools } from '../../open/src/index'

/**
 * Vite 插件选项
 */
export interface VitePluginOpenOptions {
  /**
   * 小程序平台
   * @default 'mp-weixin'
   */
  platform?: MPPlatform
  /**
   * 项目路径（编译产物目录）
   * @default vite 的 `build.outDir`（相对于项目根目录解析）
   */
  projectPath?: string
  /**
   * 是否自动打开开发者工具
   * @default true
   */
  open?: boolean
  /**
   * 自定义开发者工具 CLI 路径配置
   */
  cliPath?: DevtoolsConfig['cliPath']
  /**
   * 是否只在首次构建完成后打开
   * watch 模式下避免每次重新编译都打开开发者工具
   * @default true
   */
  once?: boolean
}

/**
 * 自动打开小程序开发者工具的 Vite 插件
 *
 * 在构建产物写入后（`closeBundle` 钩子）打开对应平台的开发者工具。
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { OpenDevtools } from '@uni-helper/open/vite'
 *
 * export default defineConfig({
 *   plugins: [
 *     OpenDevtools({ platform: 'mp-weixin' }),
 *   ],
 * })
 * ```
 */
export function OpenDevtools(options: VitePluginOpenOptions = {}): Plugin {
  const {
    platform = 'mp-weixin',
    projectPath,
    open = true,
    cliPath,
    once = true,
  } = options

  let viteRoot: string = process.cwd()
  let resolvedProjectPath = ''
  let opened = false

  return {
    name: 'uni-helper:vite-plugin-open',
    enforce: 'post',
    configResolved(config) {
      viteRoot = config.root
      resolvedProjectPath = resolve(viteRoot, projectPath || config.build.outDir)
    },
    async closeBundle() {
      if (!open) {
        return
      }
      if (once && opened) {
        return
      }
      opened = true

      await openDevtools(platform, resolvedProjectPath, { cliPath })
    },
  }
}

export default OpenDevtools
