import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import express from 'express';
import { UPLOADS_ROOT } from './common/uploads';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.enableCors({
    origin: config
      .get<string>('CORS_ORIGIN', 'http://localhost:5173')
      .split(',')
      .map((origen) => origen.trim()),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const uploadsPath = UPLOADS_ROOT;

  for (const carpeta of ['categories', 'products']) {
    const ruta = join(uploadsPath, carpeta);

    if (!existsSync(ruta)) {
      mkdirSync(ruta, {
        recursive: true,
      });
    }
  }

  app.use(
    '/uploads',
    express.static(uploadsPath, {
      // Evita que el navegador interprete un archivo
      // como algo distinto a lo que declara ser.
      setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
      },
    }),
  );

  await app.listen(
    Number(config.get('PORT', 3000)),
  );
}

void bootstrap();
