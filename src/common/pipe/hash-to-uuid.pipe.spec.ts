import { describe, expect, it } from '@jest/globals'
import { ValidationException } from '@common/exception'
import { uuidToHash } from '@common/util'
import { HashToUuidPipe } from './hash-to-uuid.pipe'

describe('HashToUuidPipe', () => {
  const pipe = new HashToUuidPipe()

  it('should convert valid hash to uuid', async () => {
    const uuid = '11111111-1111-4111-8111-111111111111'
    const hash = uuidToHash(uuid)

    await expect(pipe.transform(hash)).resolves.toBe(uuid)
  })

  it('should throw validation exception for invalid hash', async () => {
    await expect(pipe.transform('invalid-hash' as never)).rejects.toBeInstanceOf(ValidationException)
  })
})
