import { describe, expect, it } from '@jest/globals'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { interceptors } from './all'
import { SerializeInterceptor } from './serialize.interceptor'

describe('interceptors', () => {
  it('should register serialize interceptor with APP_INTERCEPTOR token', () => {
    expect(interceptors).toHaveLength(1)
    expect(interceptors[0]).toEqual({
      provide: APP_INTERCEPTOR,
      useClass: SerializeInterceptor,
    })
  })
})
