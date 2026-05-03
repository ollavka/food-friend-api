import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import {
  ApiBearerAccessTokenAuth,
  ApiBearerAuthExceptionResponse,
  ApiValidationExceptionResponse,
} from '@swagger/decorator'
import { successApiSchemaRef } from '@swagger/util'
import { PantryMatchRecipesApiModel } from '../api-model'
import { PantryMatchDto } from '../dto'

export function GetPantryMatchRecipesDocs(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Match recipes by pantry products',
      description: 'Return recipes that can be prepared from provided pantry products with coverage metrics.',
    }),
    ApiBody({ type: PantryMatchDto, required: true }),
    ApiOkResponse({
      description: 'Pantry matched recipes successfully retrieved',
      schema: successApiSchemaRef(PantryMatchRecipesApiModel),
    }),
    ApiBearerAccessTokenAuth(),
    ApiBearerAuthExceptionResponse(),
    ApiValidationExceptionResponse([
      {
        property: 'items',
        value: [],
        constraints: { arrayMinSize: 'Field items must contain at least 1 element(s).' },
      },
      {
        property: 'items.0.productId',
        value: 'invalid-id',
        constraints: { isId: 'Field productId must be a valid identifier.' },
      },
      {
        property: 'minCoveragePercent',
        value: 101,
        constraints: { max: 'Field minCoveragePercent must be less or equals to 100.' },
      },
    ]),
  )
}
