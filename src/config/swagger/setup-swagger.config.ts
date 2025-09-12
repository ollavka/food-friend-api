import { writeFile } from 'fs'
import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { toJsonString } from '@common/util'
import { swaggerExtraModels } from '@swagger/api-model/all'

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Food Friend API')
    .setDescription('API documentation for the Food Friend app')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        name: 'Authorization',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'Access token',
    )
    .build()

  const apiDocument = SwaggerModule.createDocument(app, config, { extraModels: swaggerExtraModels })

  SwaggerModule.setup('docs', app, apiDocument, {
    customSiteTitle: 'Food Friend API Docs',
    swaggerOptions: { persistAuthorization: true },
  })

  writeFile('./openapi.json', toJsonString(apiDocument), (err) => {
    if (err) {
      console.error('An error occurred while save api docs: ', err)
    }
  })
}
