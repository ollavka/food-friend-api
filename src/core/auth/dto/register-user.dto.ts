import { IsNotEmpty, IsString } from 'class-validator'
import { IsEmail, IsPassword } from '@common/validation'

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  public firstName: string

  @IsNotEmpty()
  @IsString()
  public lastName: string

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  public email: string

  @IsPassword()
  public password: string
}
