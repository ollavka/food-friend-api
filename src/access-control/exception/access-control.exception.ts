import { Exception, ExceptionDetails } from '@common/exception'

export abstract class AccessControlException extends Exception {
  protected constructor(type: string, message: string, details: ExceptionDetails = { stack: null }) {
    const { stack, ...restDetails } = details

    super(message, { type: `access-control.${type}`, details: restDetails, stack: <string>(stack ?? '') })
  }
}
