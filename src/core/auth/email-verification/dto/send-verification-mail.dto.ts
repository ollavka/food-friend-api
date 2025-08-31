import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import { RegisterUserDto } from '@core/auth/dto'

export class SendVerificationMailDto extends PickType(RegisterUserDto, ['email'] as const) {
  @IsString()
  @ApiProperty({ description: 'User name', example: 'John, John Doe etc.' })
  public userName: string
}
