import { describe, expect, it } from 'vitest'
import { createDefaultHandlers, openDevtools } from '../src/index'

describe('open sdk facade', () => {
  it('creates default platform handlers', () => {
    const handlers = createDefaultHandlers()

    expect(handlers).toHaveLength(1)
    expect(handlers[0]?.platform).toBe('mp-weixin')
  })

  it('openDevtools returns false for platforms without a handler', async () => {
    const result = await openDevtools('mp-baidu', 'dist/dev/mp-weixin')

    expect(result).toBe(false)
  })
})
