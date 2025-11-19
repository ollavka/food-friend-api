import { ApiAuthorizationExceptionResponse } from './api-authorization-exception-response.decorator'

export function ApiUserStatusPolicyExceptionResponse(onlyActiveStatus?: boolean): MethodDecorator {
  const messageOverride = 'Authorization failed.'

  return ApiAuthorizationExceptionResponse({
    description: 'User status policy failed',
    variants: [
      ...(onlyActiveStatus
        ? [
            {
              typeKey: 'unverified',
              messageOverride,
              summary: 'Email not confirmed',
              details: {
                type: 'object',
                properties: { reason: { type: 'string' } },
                required: ['reason'],
              },
              example: { reason: 'Email not confirmed. Please verify your email address in your profile settings.' },
            },
          ]
        : []),
      {
        typeKey: 'blocked',
        messageOverride,
        summary: 'User account is blocked',
        details: {
          type: 'object',
          properties: { reason: { type: 'string' } },
          required: ['reason'],
        },
        example: { reason: 'Your account has been blocked. Please contact support.' },
      },
      {
        typeKey: 'forbidden',
        messageOverride,
        summary: 'Forbidden resource (fallback)',
        details: {
          type: 'object',
          properties: { reason: { type: 'string' } },
          required: ['reason'],
        },
        example: { reason: 'Access denied. Please contact support.' },
      },
    ],
  })
}
