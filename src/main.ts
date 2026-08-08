import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.enableCors({
    origin: config.get<string>('CORS_ORIGINS', '*') === '*'
      ? true
      : config.get<string>('CORS_ORIGINS')!.split(',').map((item) => item.trim()),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AhanChi API')
    .setDescription('API for scrap-metal purchases, seller balances and reports')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = config.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
