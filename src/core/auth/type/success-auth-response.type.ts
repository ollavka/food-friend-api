import { AuthTokens } from './auth-tokens.type'

export type SuccessAuthResponse = Pick<AuthTokens, 'accessToken'>
