import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'

export const getCorsOptions = (allowedOrigins: string[]): CorsOptions => ({
  credentials: true,
  exposedHeaders: ['set-cookie', 'authorization'],
  origin: (origin, callback) => {
    const isAllowedOrigin = !origin || allowedOrigins.includes(origin)
    const corsError = isAllowedOrigin ? null : new Error(`CORS policy: origin ${origin} not allowed.`)
    return callback(corsError, isAllowedOrigin)
  },
})
