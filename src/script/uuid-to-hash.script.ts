import { isUUID } from 'class-validator'
import { uuidToHash } from '@common/util'
;(() => {
  const [, , uuid] = process.argv
  if (!uuid) {
    console.error('UUID argument is required.')
    process.exit()
  }
  if (!isUUID(uuid)) {
    console.error('UUID is invalid.')
    process.exit()
  }
  console.warn('Hash:', uuidToHash(uuid))
})()
