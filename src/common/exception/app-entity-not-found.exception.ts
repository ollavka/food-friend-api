import { HttpStatus } from '@nestjs/common'
import { Uuid } from '../type'
import { isEmptyObject, isUuid, uuidToHash } from '../util'
import { AppException } from '.'

export class AppEntityNotFoundException extends AppException {
  public httpStatus: HttpStatus = HttpStatus.NOT_FOUND

  public constructor(entityType: string, identity: Record<string, unknown> & { id?: Uuid }) {
    super('entity-not-found', 'Entity not found.')

    const safeIdentity = { ...identity }
    const isIdentityEmpty = isEmptyObject(safeIdentity)

    if (!isIdentityEmpty && isUuid(safeIdentity.id)) {
      safeIdentity.id = uuidToHash(safeIdentity.id)
    }

    this.details = { entityType, identity: safeIdentity }
  }

  public static byId(entityType: string, id: Uuid): AppEntityNotFoundException {
    return new this(entityType, { id })
  }

  public static by(entityType: string, where: Record<string, unknown>): AppEntityNotFoundException {
    return new this(entityType, where)
  }
}
