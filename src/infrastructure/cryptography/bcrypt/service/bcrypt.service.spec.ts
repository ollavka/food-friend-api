import { describe, expect, it } from '@jest/globals'
import { BcryptService } from './bcrypt.service'

describe('BcryptService', () => {
  const service = new BcryptService()

  it('should hash and compare values', async () => {
    const hash = await service.hash('password-123')

    expect(hash).not.toBe('password-123')
    expect(await service.compare('password-123', hash)).toBe(true)
    expect(await service.compare('wrong', hash)).toBe(false)
  })

  it('should return false for nullable hash', async () => {
    expect(await service.compare('password-123', null)).toBe(false)
  })
})
