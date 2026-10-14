import 'reflect-metadata';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.use(helmet());
  app.enableCors({
    origin: [
      'https://jkbalaji.in',
      'https://www.jkbalaji.in',
      'https://admin.jkbalaji.in',
      'https://cheyyarbalaji.com',
      'https://www.cheyyarbalaji.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    credentials: true,
  });

  app.setGlobalPrefix(process.env.APP_GLOBAL_PREFIX ?? 'api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: process.env.APP_DEFAULT_VERSION ?? '1',
  });

  const port = Number(process.env.APP_PORT ?? 4000);
  const host = process.env.APP_HOST ?? '127.0.0.1';
  await app.listen(port, host);
}

void bootstrap();
