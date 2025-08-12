import { ApiProperty } from '@nestjs/swagger'
import { HttpExceptionApiModel } from './http-exception.api-model'

export class ErrorResponseApiModel {
  @ApiProperty({ description: 'Response status', enum: ['error'] })
  public status: 'error'

  @ApiProperty({ description: 'Response error', type: HttpExceptionApiModel })
  public error: HttpExceptionApiModel
}
