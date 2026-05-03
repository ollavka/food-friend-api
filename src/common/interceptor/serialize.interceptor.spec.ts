import { describe, expect, it, jest } from '@jest/globals'
import { ClassSerializerInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { lastValueFrom, of } from 'rxjs'
import { SerializeInterceptor } from './serialize.interceptor'

describe('SerializeInterceptor', () => {
  it('should wrap serialized response into success envelope', async () => {
    const interceptor = new SerializeInterceptor(new Reflector())
    const superSpy = jest
      .spyOn(ClassSerializerInterceptor.prototype, 'intercept')
      .mockReturnValue(of({ id: 'r1' }) as never)

    const result = await lastValueFrom(interceptor.intercept({} as never, {} as never))

    expect(result).toEqual({
      status: 'success',
      data: { id: 'r1' },
    })

    superSpy.mockRestore()
  })

  it('should return null data when serialized value is empty', async () => {
    const interceptor = new SerializeInterceptor(new Reflector())
    const superSpy = jest
      .spyOn(ClassSerializerInterceptor.prototype, 'intercept')
      .mockReturnValue(of(undefined) as never)

    const result = await lastValueFrom(interceptor.intercept({} as never, {} as never))

    expect(result).toEqual({
      status: 'success',
      data: null,
    })

    superSpy.mockRestore()
  })
})
