import { ValidationError } from '@nestjs/common'
import { I18nContext } from 'nestjs-i18n'
import { ValidationEntry, ValidationException } from '../../exception'

type Path = Array<number | string>

export class ValidationExceptionFactory {
  public static fromValidationErrors(errors: ValidationError[]): ValidationException {
    const entries = this.getEntriesFromErrors(errors)
    return new ValidationException(...entries)
  }

  private static getEntriesFromErrors(errors: ValidationError[]): ValidationEntry[] {
    return (<ValidationEntry[]>[]).concat(...errors.map((error) => this.getEntriesFromError(error)))
  }

  private static getEntriesFromError(error: ValidationError, path: Path = []): ValidationEntry[] {
    const entries: ValidationEntry[] = []
    const key = Array.isArray(error.target) ? +error.property : error.property

    const newPath = [...path, key]

    if (error.children?.length) {
      error.children.map((childError) => entries.push(...this.getEntriesFromError(childError, newPath)))
    } else if (error.constraints) {
      const property = this.getProperty(newPath)
      const value = this.getValue(error.value)
      const constraints = this.prepareConstraints(property, value, error.constraints, error.contexts)
      entries.push({ property, value, constraints })
    }

    return entries
  }

  private static getProperty(path: Path): string {
    return path
      .map((key) => (typeof key === 'number' ? `[${key}]` : `.${key}`))
      .join('')
      .replace(/^\./, '')
  }

  private static getValue(value: unknown): unknown {
    return value === null || ['boolean', 'number', 'bigint', 'string'].includes(typeof value) ? value : undefined
  }

  private static prepareConstraints(
    property: string,
    value: unknown,
    constraints: Record<string, string>,
    contexts?: Record<string, unknown>,
  ): Record<string, string> {
    return Object.entries(constraints).reduce((result, [id, message]) => {
      const localized = this.getLocalizedConstraint(property, value, message, contexts)
      switch (id) {
        case 'whitelistValidation':
          id = 'unexpectedProperty'
          break
        case 'nestedValidation':
          message = message.charAt(0).toUpperCase() + message.slice(1)
          break
      }

      const fallbackMessage =
        message
          .replace(new RegExp(`^All ${property}'s elements `), 'All elements ')
          .replace(new RegExp(`^each value in ${property} `), 'Each value ')
          .replace(new RegExp(`^${property} `), 'Value ')
          .replace(new RegExp(`^property ${property} should not exist$`), 'Property should not exist')
          .replace(/\.+$/, '') + '.'

      return { ...result, [id]: localized ?? fallbackMessage }
    }, {})
  }

  private static getLocalizedConstraint(
    property: string,
    value: unknown,
    message: string,
    contexts?: Record<string, unknown>,
  ): string | null {
    const separatorIndex = message.indexOf('|')

    if (separatorIndex < 0) {
      return null
    }

    const translationKey = message.slice(0, separatorIndex)
    const argsSlice = message.slice(separatorIndex + 1)

    if (!translationKey) {
      return null
    }

    try {
      const args = argsSlice ? <Record<string, unknown>>JSON.parse(argsSlice) : {}
      const i18n = I18nContext.current()

      if (!i18n) {
        return null
      }

      const normalizedConstraints = this.normalizeConstraintArgs(args.constraints)
      return <string>i18n.t(translationKey, {
        defaultValue: message,
        args: {
          property,
          value,
          contexts,
          ...args,
          constraints: normalizedConstraints ?? {},
        },
      })
    } catch {
      return null
    }
  }

  private static normalizeConstraintArgs(constraints: unknown): Record<string, unknown> | undefined {
    if (Array.isArray(constraints)) {
      return constraints.reduce<Record<string, unknown>>((acc, value, index) => {
        acc[index.toString()] = value
        return acc
      }, {})
    }

    return typeof constraints === 'object' && constraints !== null ? <Record<string, unknown>>constraints : undefined
  }
}
