import 'reflect-metadata';
import 'dotenv/config';
import 'tsconfig-paths/register';
import '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, raw } from 'express';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.use(json({ limit: '1mb' }));
  app.use(
    '/ia-tutor/anexos/upload',
    raw({
      type: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/octet-stream',
      ],
      limit: '2mb',
    }),
  );

  app.use(helmet());

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? [
      'http://localhost:3001',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
