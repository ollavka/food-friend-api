import { Injectable, PipeTransform } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { ResourceIdDto } from '@common/dto'
import { ValidationExceptionFactory } from '@common/exception'
import { Hash, Uuid } from '@common/type'
import { hashToUuid } from '@common/util'

@Injectable()
export class HashToUuidPipe implements PipeTransform {
  public async transform(id: Hash): Promise<Uuid> {
    const errors = await validate(plainToInstance(ResourceIdDto, { id }))

    if (errors.length > 0) {
      throw ValidationExceptionFactory.fromValidationErrors(errors)
    }

    return hashToUuid(id)
  }
}
