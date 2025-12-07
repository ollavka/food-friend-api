import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { ApiLanguage } from '@swagger/decorator'
import { successApiArraySchemaRef } from '@swagger/util'
import { RecipeDifficultyApiModel } from '../api-model'

export function GetRecipeDifficultyListDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve recipe difficulty levels',
      description: 'Retrieve available recipe difficulty levels with translated label',
    }),
    ApiLanguage(),
    ApiOkResponse({
      description: 'Recipe difficulty list successfully retrieved',
      schema: successApiArraySchemaRef(RecipeDifficultyApiModel),
    }),
  )
}
