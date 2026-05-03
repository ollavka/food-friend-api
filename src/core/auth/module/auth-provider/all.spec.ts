import { describe, expect, it } from '@jest/globals'
import { authProviderModules } from './all'
import { GoogleProviderModule } from './google-provider'

describe('authProviderModules', () => {
  it('should include google provider module', () => {
    expect(authProviderModules).toEqual([GoogleProviderModule])
  })
})
