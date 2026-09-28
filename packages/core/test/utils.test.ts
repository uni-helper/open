import { Buffer } from 'node:buffer'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'pathe'
import { describe, expect, it } from 'vitest'
import { ensureJsonSync } from '../src/utils/fs'
import { decodeGbk } from '../src/utils/gbk'

describe('ensureJsonSync', () => {
  it('creates missing json file with default content', () => {
    const dir = mkdtempSync(join(tmpdir(), 'unhopen-'))
    const filePath = join(dir, 'nested', 'project.config.json')

    ensureJsonSync(filePath, { appid: 'touristappid' })

    expect(existsSync(filePath)).toBe(true)
    expect(JSON.parse(readFileSync(filePath, 'utf-8'))).toEqual({ appid: 'touristappid' })
  })

  it('does not overwrite existing file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'unhopen-'))
    const filePath = join(dir, 'project.config.json')
    writeFileSync(filePath, '{"appid":"my-appid"}')

    ensureJsonSync(filePath, { appid: 'touristappid' })

    expect(JSON.parse(readFileSync(filePath, 'utf-8'))).toEqual({ appid: 'my-appid' })
  })
})

describe('decodeGbk', () => {
  it('decodes gbk encoded bytes', () => {
    // “微信” 的 GBK 编码为 CE A2 D0 C5
    const buffer = Buffer.from([0xCE, 0xA2, 0xD0, 0xC5])
    expect(decodeGbk(buffer)).toBe('微信')
  })

  it('returns empty string for empty input', () => {
    expect(decodeGbk()).toBe('')
  })
})
