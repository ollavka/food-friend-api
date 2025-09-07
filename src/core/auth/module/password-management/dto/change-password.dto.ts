import { ApiProperty } from '@nestjs/swagger'
import { IsPassword } from '@common/validation'

export class ChangePasswordDto {
  @IsPassword()
  @ApiProperty({ description: 'User password', example: 'Current!2345', minLength: 8, maxLength: 32, required: true })
  public currentPassword: string

  @IsPassword()
  @ApiProperty({ description: 'User password', example: 'New!2345', minLength: 8, maxLength: 32, required: true })
  public newPassword: string
}
