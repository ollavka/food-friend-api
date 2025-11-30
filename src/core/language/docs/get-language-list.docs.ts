import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { ApiLanguage } from '@swagger/decorator'
import { successApiArraySchemaRef } from '@swagger/util'
import { LanguageApiModel } from '../api-model'

export function GetLanguageListDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve language list',
      description: 'Retrieve available languages with translated full label, short label, code and locale',
    }),
    ApiLanguage(),
    ApiOkResponse({
      description: 'Language list successfully retrieved',
      schema: successApiArraySchemaRef(LanguageApiModel),
    }),
  )
}
