import { UseInterceptors, applyDecorators } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

export const FileUpload = (fieldName = 'file'): MethodDecorator =>
  applyDecorators(UseInterceptors(FileInterceptor(fieldName)))
