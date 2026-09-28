import { join } from 'pathe'
import { isMacOS } from 'std-env'
import { describe, expect, it } from 'vitest'
import { buildDevtoolsCliPath, findSoftwareInstallLocation } from '../src/utils/find-software'

describe('buildDevtoolsCliPath', () => {
  it('joins install path with the current platform suffix', () => {
    const suffix = { mac: 'Contents/MacOS/cli', windows: 'cli.bat' }
    const installPath = isMacOS ? '/Applications/wechatwebdevtools' : 'C:\\Program Files\\微信开发者工具'

    const result = buildDevtoolsCliPath(installPath, suffix)

    expect(result).toBe(join(installPath, isMacOS ? suffix.mac : suffix.windows))
  })
})

describe('findSoftwareInstallLocation', () => {
  it('returns null for invalid input', () => {
    // @ts-expect-error 测试非法入参
    expect(findSoftwareInstallLocation(null)).toBeNull()
    // @ts-expect-error 测试非法入参
    expect(findSoftwareInstallLocation('wechatwebdevtools')).toBeNull()
  })

  it('returns null when the software is not installed', () => {
    const result = findSoftwareInstallLocation({
      mac: 'definitely-not-installed-devtools-xyz',
      windows: 'definitely-not-installed-devtools-xyz',
    })

    expect(result).toBeNull()
  })
})
