import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsPassword, IsString } from '@common/validation'

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({ description: 'User email', example: 'john.doe@mail.com', required: true })
  public email: string

  @IsPassword()
  @ApiProperty({ description: 'User password', example: 'Test!234', minLength: 8, maxLength: 32, required: true })
  public password: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'User first name', example: 'John', required: true })
  public firstName: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'User last name', example: 'Doe', required: true })
  public lastName: string
}
