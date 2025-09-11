import { Injectable } from '@nestjs/common'
import { AuthMethod, UserRole, UserStatus } from '@prisma/client'
import { Request, Response } from 'express'
import { AccessControlAuthenticationException } from '@access-control/exception'
import { AppConflictException } from '@common/exception'
import { UserService } from '@core/user'
import { BcryptService } from '@infrastructure/cryptography/bcrypt'
import { MailService } from '@infrastructure/mail'
import { AccessTokenApiModel, OtpTicketApiModel } from '../api-model'
import { LoginUserDto, RegisterUserDto } from '../dto'
import { AuthSessionService, EmailVerificationService } from '../module'

@Injectable()
export class AuthService {
  public constructor(
    private readonly userService: UserService,
    private readonly bcryptService: BcryptService,
    private readonly mailService: MailService,
    private readonly authSessionService: AuthSessionService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  public async register({ password, ...userDto }: RegisterUserDto): Promise<OtpTicketApiModel> {
    const isUserExists = await this.userService.findByEmail(userDto.email, { select: { id: true } })

    if (isUserExists) {
      throw new AppConflictException('email-taken', 'This email address is already taken.')
    }

    const hashedPassword = password ? await this.bcryptService.hash(password) : undefined

    const createdUser = await this.userService.create({
      ...userDto,
      password: hashedPassword,
      status: UserStatus.UNVERIFIED,
      role: UserRole.REGULAR,
      authMethod: AuthMethod.CREDENTIALS,
      lastEmailVerificationMailSentAt: null,
      lastResetPasswordMailSentAt: null,
    })

    const [, emailVerificationTicketModel] = await Promise.all([
      this.mailService.sendWelcomeMail(createdUser.email, createdUser.firstName),
      this.emailVerificationService.sendVerificationMail(createdUser.email, false),
    ])

    return emailVerificationTicketModel
  }

  public async login(res: Response, { email, password }: LoginUserDto): Promise<AccessTokenApiModel> {
    const user = await this.userService.findByEmail(email)

    if (!user || !user.password) {
      throw new AccessControlAuthenticationException('credentials', 'Invalid credentials.')
    }

    const isPasswordsMatches = await this.bcryptService.compare(password, user.password)

    if (!isPasswordsMatches) {
      throw new AccessControlAuthenticationException('credentials', 'Invalid credentials.')
    }

    return this.authSessionService.auth(res, user)
  }

  public async logout(req: Request, res: Response): Promise<null> {
    return this.authSessionService.logout(req, res)
  }

  public async refresh(req: Request, res: Response): Promise<AccessTokenApiModel> {
    return this.authSessionService.refresh(req, res)
  }
}
