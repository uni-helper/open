import type { DevtoolsConfig, MPPlatform } from '../../../open/src/index'
import { logger, MP_PLATFORMS, openDevtools } from '../../../open/src/index'

/**
 * 打开命令的选项
 */
export interface OpenCommandOptions {
  /** 小程序平台，默认 'mp-weixin' */
  platform?: string
  /** 自定义开发者工具 CLI 路径 */
  cliPath?: string
}

/**
 * 校验平台是否受支持
 */
export function isSupportedPlatform(platform: string): platform is MPPlatform {
  return platform in MP_PLATFORMS
}

/**
 * 执行打开开发者工具命令
 *
 * @param projectPath 项目路径（编译产物目录）
 * @param options 命令选项
 * @returns 进程退出码
 */
export async function runOpenCommand(
  projectPath: string,
  options: OpenCommandOptions = {},
): Promise<number> {
  const platform = options.platform || 'mp-weixin'

  if (!isSupportedPlatform(platform)) {
    logger.error(`不支持的平台: ${platform}`)
    logger.info(`支持的平台: ${Object.keys(MP_PLATFORMS).join(', ')}`)
    return 1
  }

  const config: DevtoolsConfig = {}
  if (options.cliPath) {
    config.cliPath = { [platform]: options.cliPath }
  }

  const success = await openDevtools(platform, projectPath, config)
  return success ? 0 : 1
}
