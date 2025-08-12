import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'

class AuthValidationErrorEntryApiModel {
  @ApiProperty({ example: 'email', description: 'Field that has not passed validation' })
  public property: string

  @ApiProperty({ example: 'invalid-mail@mailcom', description: 'Actual value that has not passed validation' })
  public value: unknown

  @ApiProperty({
    description: 'Message for each validation rule',
    type: 'object',
    additionalProperties: { type: 'string' },
    example: { isEmail: 'Value must be an email.' },
  })
  public constraints: Record<string, string>
}

@ApiExtraModels(AuthValidationErrorEntryApiModel)
export class AuthValidationDetailsApiModel {
  @ApiProperty({
    description: 'List of errors by fields',
    type: 'array',
    items: { $ref: getSchemaPath(AuthValidationErrorEntryApiModel) },
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
