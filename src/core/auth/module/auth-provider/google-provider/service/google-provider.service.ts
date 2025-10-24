import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { AuthProvider, User, UserRole, UserStatus } from '@prisma/client'
import { Response } from 'express'
import { OAuth2Client, TokenPayload } from 'google-auth-library'
import { Nullable, Uuid } from '@common/type'
import { def } from '@common/util'
import { AccessTokenApiModel } from '@core/auth/api-model'
import { AuthSessionService, ProviderAccountService } from '@core/auth/module'
import { UserService } from '@core/user'
import { PrismaService } from '@infrastructure/database'
import { GOOGLE_AUTH_CLIENT_TOKEN } from '../constant'

@Injectable()
export class GoogleProviderService {
  public constructor(
    @Inject(GOOGLE_AUTH_CLIENT_TOKEN) private readonly googleAuthClient: OAuth2Client,
    private readonly authSessionService: AuthSessionService,
    private readonly userService: UserService,
    private readonly providerAccountService: ProviderAccountService,
    private readonly prismaService: PrismaService,
  ) {}

  public async googleAuth(res: Response, idToken: string): Promise<AccessTokenApiModel> {
    const user = await this.handleGoogleToken(idToken, null, false)
    return this.authSessionService.auth(res, user)
  }

  public async linkGoogleAccount(idToken: string, userEmail: Nullable<string>): Promise<void> {
    await this.handleGoogleToken(idToken, userEmail, true)
  }

  public async unlinkGoogleAccount(userId: Uuid): Promise<void> {
    const user = await this.userService.findById(userId, { include: { accounts: true } })
    const userAccounts = user?.accounts ?? []
    const googleAccount = userAccounts.find((account) => account.provider === AuthProvider.GOOGLE) ?? null

    if (!googleAccount) {
      return
    }

    const restAccounts = userAccounts.filter((account) => account.provider !== AuthProvider.GOOGLE)
    const canUnlinkAccount = restAccounts.length > 0 || def(user?.password || null)

    if (!canUnlinkAccount) {
      throw new BadRequestException('It is impossible to unlink the provider, as there are no other ways to authorize.')
    }

    await this.providerAccountService.removeAccount(userId, AuthProvider.GOOGLE)
  }

  private async handleGoogleToken(idToken: string, userEmail: Nullable<string>, strict = true): Promise<User> {
    const googleTicket = await this.googleAuthClient.verifyIdToken({ idToken }).catch(() => {
      throw new BadRequestException('Invalid or expired Google ID token.')
    })

    const tokenPayload = googleTicket.getPayload() ?? null

    if (!this.validateTokenPayload(tokenPayload)) {
      throw new BadRequestException('Invalid Google token payload.')
    }

    const user = await this.prismaService.$transaction(async (tx) => {
      const user = await this.userService.findOrCreate(
        userEmail ?? tokenPayload.email,
        {
          email: tokenPayload.email,
          firstName: tokenPayload?.given_name ?? null,
          lastName: tokenPayload?.family_name ?? null,
          status: UserStatus.ACTIVE,
          role: UserRole.REGULAR,
        },
        tx,
      )

      await this.providerAccountService.findOrCreate(tokenPayload, AuthProvider.GOOGLE, user, tx, strict)

      return user
    })

    return user
  }

  private validateTokenPayload(payload: TokenPayload | null): payload is TokenPayload & {
    email: string
    email_verified: true
  } {
    if (!payload || !payload.sub) {
      throw new BadRequestException('Invalid or expired Google ID token.')
    }

    if (!payload?.email) {
      throw new BadRequestException('Google email is required.')
    }

    if (!payload?.email_verified) {
      throw new BadRequestException('Google email must be verified to sign in.')
    }

    return true
  }
}
