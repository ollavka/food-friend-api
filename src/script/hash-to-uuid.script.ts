import { hashToUuid, isHash } from '@common/util'
;(() => {
  const [, , hash] = process.argv
  if (!hash) {
    console.error('Hash argument is required.')
    process.exit()
  }
  if (!isHash(hash)) {
    console.error('Hash is invalid.')
    process.exit()
  }
  console.warn('UUID:', hashToUuid(hash))
})()
