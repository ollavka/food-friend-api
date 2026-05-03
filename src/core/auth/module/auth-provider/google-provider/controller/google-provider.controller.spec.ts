import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { GoogleProviderController } from './google-provider.controller'

describe('GoogleProviderController', () => {
  const googleProviderService: any = {
    googleAuth: jest.fn(),
    linkGoogleAccount: jest.fn(),
    unlinkGoogleAccount: jest.fn(),
  }

  const localizationFactory: any = {
    createFor: jest.fn(),
  }

  let controller: GoogleProviderController

  beforeEach(() => {
    jest.clearAllMocks()

    localizationFactory.createFor.mockReturnValue((key: string) => key)
    controller = new GoogleProviderController(googleProviderService, localizationFactory)
  })

  it('should delegate googleAuth', async () => {
    googleProviderService.googleAuth.mockResolvedValue({ accessToken: 'token' })

    const result = await controller.googleAuth({} as never, { idToken: 'id-token' } as never, 'EN' as never)

    expect(result).toEqual({ accessToken: 'token' })
    expect(googleProviderService.googleAuth).toHaveBeenCalledWith({}, 'id-token', 'EN')
  })

  it('should link and unlink google account with localized message', async () => {
    googleProviderService.linkGoogleAccount.mockResolvedValue(undefined)
    googleProviderService.unlinkGoogleAccount.mockResolvedValue(undefined)

    const linked = await controller.linkGoogleAccount(
      { email: 'user@example.com' } as never,
      { idToken: 'id-token' } as never,
      'EN' as never,
    )
    const unlinked = await controller.unlinkGoogleAccount({ id: 'user-1' } as never)

    expect(linked).toEqual({ message: 'google-account.linked' })
    expect(unlinked).toEqual({ message: 'google-account.unlinked' })
  })
})
