import { INestApplication } from '@nestjs/common'
import * as qs from 'qs'

export function setupQs(app: INestApplication): void {
  const httpAdapter = app.getHttpAdapter()
  const instance = httpAdapter.getInstance()

  instance.set('query parser', (str: string) =>
    qs.parse(str, {
      allowPrototypes: false,
      depth: 10,
      arrayLimit: 100,
    }),
  )
}
