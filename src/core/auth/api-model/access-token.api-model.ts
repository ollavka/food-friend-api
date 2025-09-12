import { PickType } from '@nestjs/swagger'
import { AuthTokensApiModel } from './auth-tokens.api-model'

export class AccessTokenApiModel extends PickType(AuthTokensApiModel, ['accessToken'] as const) {}
