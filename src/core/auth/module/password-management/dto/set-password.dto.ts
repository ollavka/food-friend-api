import { PickType } from '@nestjs/swagger'
import { RegisterUserDto } from '@core/auth/dto'

export class SetPasswordDto extends PickType(RegisterUserDto, ['password'] as const) {}
