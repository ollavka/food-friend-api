import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { ApiLanguage, ApiValidationExceptionResponse } from '@swagger/decorator'
import { successApiArraySchemaRef } from '@swagger/util'
import { MeasurementUnitApiModel } from '../api-model'

export function GetMeasurementUnitListDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve measurement units',
      description: 'Retrieve available measurement units with key and translated label',
    }),
    ApiLanguage(),
    ApiOkResponse({
      description: 'Measurement base type list successfully retrieved',
      schema: successApiArraySchemaRef(MeasurementUnitApiModel),
    }),
    ApiValidationExceptionResponse([
      {
        property: 'filter.isUserSelectable',
        value: 'invalid-boolean-value',
        constraints: { isBoolean: 'Field filter.isUserSelectable must be boolean.' },
      },
      {
        property: 'filter.isBaseUnit',
        value: 'invalid-boolean-value',
        constraints: { isBoolean: 'Field filter.isBaseUnit must be boolean' },
      },
    ]),
  )
}
