import { ValidateBy, ValidationOptions } from 'class-validator'

export function IsPostgresURL(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isPostgresURL',
      constraints: ['postgresql://user:pass@host:port/db-name'],
      validator: {
        validate(value): boolean {
          if (typeof value !== 'string') {
            return false
          }

          try {
            const { protocol, hostname, password, port, pathname } = new URL(value)
            const isPostgresProtocol = protocol === 'postgresql:'
            const isValidPort = +port >= 1 && +port <= 65432
            const isValidDBName = !!pathname.slice(1).trim()
            return isPostgresProtocol && isValidPort && isValidDBName && !!hostname.trim() && !!password.trim()
          } catch (_err: unknown) {
            return false
          }
        },
        defaultMessage() {
          return '$property must be a valid PostgreSQL URL, e.g. $constraint1'
        },
      },
    },
    validationOptions,
  )
}
