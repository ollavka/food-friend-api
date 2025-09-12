import { ApiProperty } from '@nestjs/swagger'

class AuthValidationErrorEntryApiModel {
  public property: string

  public value: unknown

  public constraints: Record<string, string>
}

export class AuthValidationDetailsApiModel {
  @ApiProperty({
    description: 'List of errors by fields',
    type: 'array',
    example: [
      {
        property: 'email',
        value: 'invalid-mail@mailcom',
        constraints: { isEmail: 'Value must be an email.' },
      },
      {
        property: 'password',
        value: 'Invalid-password',
        constraints: { containsDigits: 'Value must contains at least one digit.' },
      },
    ],
  })
  public entries: AuthValidationErrorEntryApiModel[]
}
