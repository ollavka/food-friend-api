import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
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
    .addSecurityRequirements('Access token')
    .build()

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config, { extraModels: swaggerExtraModels }), {
    customSiteTitle: 'Food Friend API Docs',
    swaggerOptions: { persistAuthorization: true },
  })
}
