import type { OpenCommandOptions } from './commands/open'
import { createRequire } from 'node:module'
import process from 'node:process'
import { cac } from 'cac'
import { logger, MP_PLATFORMS } from '../../open/src/index'
import { runOpenCommand } from './commands/open'

// 打包后相对于 dist 产物取发布包的 package.json，保证版本号与发布版本一致
const { version } = createRequire(import.meta.url)('../package.json') as { version: string }

/**
 * CLI 入口，解析命令行参数并执行对应命令
 */
export async function runCLI(argv: string[] = process.argv): Promise<void> {
  const cli = cac('uni-open')

  cli
    .command('[projectPath]', '打开小程序开发者工具')
    .option('-p, --platform <platform>', '小程序平台，默认 mp-weixin')
    .option('-c, --cli-path <path>', '自定义开发者工具 CLI 路径')
    .action(async (projectPath: string | undefined, options: OpenCommandOptions) => {
      process.exitCode = await runOpenCommand(projectPath || '.', options)
    })

  cli
    .command('list', '列出支持的平台')
    .action(() => {
      for (const [platform, name] of Object.entries(MP_PLATFORMS)) {
        logger.log(`  ${platform.padEnd(13)} ${name}`)
      }
    })

  cli.help()
  cli.version(version)
  await cli.parse(argv, { run: true })
}
