import { ApiProperty } from '@nestjs/swagger'

export class SuccessMessageApiModel {
  @ApiProperty({
    description: 'Success message',
    example: 'Success',
    required: true,
  })
  public message: string
}
