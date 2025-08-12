import { HttpStatus } from '@nestjs/common'
import { TextCase } from '@common/enum'
import { TextCaseConverter } from './convert-text-case.util'
import { enumKey } from './enum.util'

type HttpExceptionProps = {
  type: string
  message: string
}

export function extractHttpExceptionProperties(statusCode: number): HttpExceptionProps {
  const statusKey = enumKey(HttpStatus, statusCode) ?? 'http-request'
  const type = TextCaseConverter.convert(statusKey, TextCase.Spinal)
  const message = `${TextCaseConverter.convert(statusKey, TextCase.Space)}.`

  return { type, message }
}
