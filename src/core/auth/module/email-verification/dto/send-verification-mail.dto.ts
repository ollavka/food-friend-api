import { PickType } from '@nestjs/swagger'
import { RegisterUserDto } from '@core/auth/dto'

export class SendVerificationMailDto extends PickType(RegisterUserDto, ['email'] as const) {}
