import { writeFile } from 'fs'
import { describe, expect, it, jest } from '@jest/globals'
import { SwaggerModule } from '@nestjs/swagger'
import { toJsonString } from '@common/util'
import { swaggerExtraModels } from '@swagger/api-model/all'
import { setupSwagger } from './setup-swagger.config'

jest.mock('fs', () => ({
  writeFile: jest.fn(),
}))

jest.mock('@common/util', () => ({
  toJsonString: jest.fn(),
}))

jest.mock('@nestjs/swagger', () => {
  const actual = jest.requireActual('@nestjs/swagger') as Record<string, unknown>

  return {
    ...actual,
    DocumentBuilder: class {
      public setTitle(): this {
        return this
      }

      public setDescription(): this {
        return this
      }

      public setVersion(): this {
        return this
      }

      public addBearerAuth(): this {
        return this
      }

      public build(): Record<string, unknown> {
        return { built: true }
      }
    },
    SwaggerModule: {
      createDocument: jest.fn(),
      setup: jest.fn(),
    },
  }
})

describe('setupSwagger', () => {
  const swaggerModuleMock = SwaggerModule as unknown as {
    createDocument: jest.Mock
    setup: jest.Mock
  }

  it('should create swagger document, configure docs route and write openapi file', () => {
    const app = { name: 'app' }
    const document = { openapi: '3.0.0' }

    swaggerModuleMock.createDocument.mockReturnValue(document)
    ;(toJsonString as any).mockReturnValue('{"openapi":"3.0.0"}')
    ;(writeFile as any).mockImplementation(
      (_path: string, _data: string, callback: ((error: Error | null) => void) | undefined) => {
        if (typeof callback === 'function') {
          callback(null)
        }
      },
    )

    setupSwagger(app as any)

    expect(swaggerModuleMock.createDocument).toHaveBeenCalledWith(app, expect.any(Object), {
      extraModels: swaggerExtraModels,
    })
    expect(swaggerModuleMock.setup).toHaveBeenCalledWith('docs', app, document, {
      customSiteTitle: 'Food Friend API Docs',
      swaggerOptions: { persistAuthorization: true },
    })
    expect(writeFile).toHaveBeenCalledWith('./openapi.json', '{"openapi":"3.0.0"}', expect.any(Function))
  })

  it('should log write errors when openapi file saving fails', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)

    swaggerModuleMock.createDocument.mockReturnValue({ openapi: '3.0.0' })
    ;(toJsonString as any).mockReturnValue('{"openapi":"3.0.0"}')
    ;(writeFile as any).mockImplementation(
      (_path: string, _data: string, callback: ((error: Error | null) => void) | undefined) => {
        if (typeof callback === 'function') {
          callback(new Error('disk error'))
        }
      },
    )

    setupSwagger({} as any)

    expect(consoleErrorSpy).toHaveBeenCalledWith('An error occurred while save api docs: ', expect.any(Error))

    consoleErrorSpy.mockRestore()
  })
})
