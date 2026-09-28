import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { parse } from 'pathe'

/**
 * 确保路径处存在 JSON 文件，不存在时创建目录并写入默认内容
 */
export function ensureJsonSync(path: string, object: any = {}): void {
  if (!existsSync(path)) {
    mkdirSync(parse(path).dir, { recursive: true })
    writeFileSync(path, JSON.stringify(object, null, 2))
  }
}
