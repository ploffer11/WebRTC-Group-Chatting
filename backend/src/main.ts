import fs from 'node:fs/promises';
import process from 'node:process';

import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const opts: NestApplicationOptions = {};

  try {
    if (process.env.NODE_ENV === 'production') {
      opts.httpsOptions = {
        ca: await fs.readFile('ca.pem'),
        key: await fs.readFile('private.pem'),
        cert: await fs.readFile('public.pem'),
      };
    }
  } catch (err) {
    console.warn('Cannot read HTTPS certificate');
  }

  const app = await NestFactory.create(AppModule, opts);

  app.enableCors({
    origin: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      // whitelist: true,
      // disableErrorMessages: true,
    }),
  );
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
