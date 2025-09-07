import { ApiProperty } from '@nestjs/swagger'
import { ToUuid } from '@common/validation'

export class ResourceIdDto {
  @ToUuid()
  @ApiProperty({
    description: 'Resource ID',
    example: 'LnT8BAUhhoJ2Y6MuB9AAZp',
    required: true,
  })
  public id: string
}
