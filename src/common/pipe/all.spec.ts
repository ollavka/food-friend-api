import { describe, expect, it } from '@jest/globals'
import { APP_PIPE } from '@nestjs/core'
import { pipes } from './all'
import { validationPipeFactory } from './validation.pipe'

describe('pipes', () => {
  it('should register validation pipe factory with APP_PIPE token', () => {
    expect(pipes).toHaveLength(1)
    expect(pipes[0]).toEqual({
      provide: APP_PIPE,
      useFactory: validationPipeFactory,
    })
  })
})
