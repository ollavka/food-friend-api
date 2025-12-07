import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { MeasurementBaseTypeKey } from '@prisma/client'
import { ApiLanguage, ApiResourceQuery, ApiValidationExceptionResponse } from '@swagger/decorator'
import { successApiArraySchemaRef } from '@swagger/util'
import { MeasurementUnitApiModel } from '../api-model'
import { MeasurementUnitFilterQueryDto } from '../dto'

export function GetMeasurementUnitListDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Retrieve measurement units',
      description: 'Retrieve available measurement units with key and translated label',
    }),
    ApiResourceQuery<MeasurementUnitFilterQueryDto>({
      filter: {
        fields: {
          baseType: {
            description:
              'Measurement base type of unit. If undefined is passed, all units will be taken; otherwise, filtering will be performed based on the type value.',
            enum: MeasurementBaseTypeKey,
            example: MeasurementBaseTypeKey.MASS,
          },
          isBaseUnit: {
            description:
              'Is base unit of each measurement type. If undefined is passed, all units will be taken; otherwise, filtering will be performed based on the Boolean value.',
            example: true,
          },
          isUserSelectable: {
            description: 'Is available unit for user view',
            example: true,
          },
        },
      },
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
        constraints: { isBoolean: 'Field filter.isBaseUnit must be boolean.' },
      },
      {
        property: 'filter.baseType',
        value: 'invalid-base-type',
        constraints: {
          isEnum: `Field filter.baseType must be one of the allowed values: ${Object.values(MeasurementBaseTypeKey).join(', ')}.`,
        },
      },
    ]),
  )
}
