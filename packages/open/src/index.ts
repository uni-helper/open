import type { DevtoolsConfig, DevtoolsHandler, MPPlatform } from '../../core/src/index'
import { MPDevtoolsLauncher } from '../../core/src/index'
import { WechatDevtoolsHandler } from '../../handlers/src/index'

export * from '../../core/src/index'
export * from '../../handlers/src/index'

/**
 * 创建默认的平台处理器列表
 * @returns 平台处理器数组
 */
export function createDefaultHandlers(): DevtoolsHandler[] {
  return [
    new WechatDevtoolsHandler(),
  ]
}

/**
 * 快捷打开小程序开发者工具
 *
 * 使用默认平台处理器创建启动器并打开指定平台的项目。
 *
 * @param platform 小程序平台
 * @param projectPath 项目路径（编译产物目录）
 * @param config 开发者工具配置
 * @returns 是否成功打开
 *
 * @example
 * ```ts
 * import { openDevtools } from '@uni-helper/open'
 *
 * await openDevtools('mp-weixin', 'dist/dev/mp-weixin')
 * ```
 */
export async function openDevtools(
  platform: MPPlatform,
  projectPath: string,
  config: DevtoolsConfig = {},
): Promise<boolean> {
  const launcher = new MPDevtoolsLauncher(config)
  launcher.registerHandlers(createDefaultHandlers())
  return launcher.open(platform, projectPath)
}
