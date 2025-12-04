import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { ApiLanguage } from '@swagger/decorator'
import { successApiArraySchemaRef } from '@swagger/util'
import { MeasurementBaseTypeApiModel } from '../api-model'

export function GetMeasurementBaseTypeListDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve measurement base type',
      description: 'Retrieve available measurement base types with key and translated label',
    }),
    ApiLanguage(),
    ApiOkResponse({
      description: 'Measurement base type list successfully retrieved',
      schema: successApiArraySchemaRef(MeasurementBaseTypeApiModel),
    }),
  )
}
