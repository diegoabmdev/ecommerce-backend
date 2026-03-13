// src/main.ts
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filter/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Prefijo global para la API
  app.setGlobalPrefix('api/v1');

  // Filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // Pipes globales para validación de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de OpenAPI (Swagger/Scalar)
  const config = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription('Documentación de la tienda - Portafolio Diego Abanto')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // UI de Scalar
  app.use(
    '/reference',
    apiReference({
      theme: 'deepSpace',
      layout: 'modern',
      content: document,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Servidor corriendo en el puerto ${port}`);
  logger.log(`Documentación disponible en: http://localhost:${port}/reference`);
}
bootstrap();
