import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { UserNutritionProfileApiModel } from '../api-model'
import { UpdateUserNutritionProfileDto } from '../dto'

export function UpdateUserNutritionProfileDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Update current user nutrition profile',
      description: 'Create or update nutrition profile used for personalized recipe recommendations.',
    }),
    ApiBody({ type: UpdateUserNutritionProfileDto, required: true }),
    ApiOkResponse({
      description: 'Nutrition profile successfully updated',
      schema: successApiSchemaRef(UserNutritionProfileApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiValidationExceptionResponse([
      {
        property: 'sex',
        value: 'INVALID',
        constraints: { isEnum: 'Field sex must be one of the allowed values: MALE, FEMALE.' },
      },
      {
        property: 'age',
        value: 10,
        constraints: { min: 'Field age must not be less than 12.' },
      },
      {
        property: 'heightCm',
        value: 100,
        constraints: { min: 'Field heightCm must not be less than 120.' },
      },
      {
        property: 'weightKg',
        value: 20,
        constraints: { min: 'Field weightKg must not be less than 30.' },
      },
      {
        property: 'targetCalories',
        value: 700,
        constraints: { min: 'Field targetCalories must not be less than 800.' },
      },
    ]),
  )
}
