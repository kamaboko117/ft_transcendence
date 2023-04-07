import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { readFileSync } from 'fs';
import { urlencoded, json } from 'express';
import helmet from 'helmet';

let httpsOptions = null;

async function bootstrap() {
  const keyP = readFileSync('/etc/nginx/certificate.key');
  const certP = readFileSync('/etc/nginx/certificate.crt');
  httpsOptions = {
    key: keyP,
    cert: certP,
  }
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.use(cookieParser());
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.use(helmet());
  await app.listen(3000);
}
bootstrap();
