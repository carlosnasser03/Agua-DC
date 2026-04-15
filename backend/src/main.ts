import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/config/logger.config';
import express from 'express';
import { Request, Response } from 'express';
import helmet from 'helmet';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// ─── Instancia Express compartida (serverless + local) ───────────────────────
const expressApp = express();
let nestApp: any;

async function createNestServer() {
  if (nestApp) return nestApp;

  const logger = new Logger('Bootstrap');
  nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    bufferLogs: true,
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // Seguridad: Helmet
  nestApp.use(helmet());

  // CORS — permite llamadas desde el admin panel y la app móvil
  // La app móvil (React Native) no está sujeta a CORS; solo el panel de admin.
  nestApp.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:4173',
      'http://localhost:3001',
      process.env.ADMIN_PANEL_URL || '',
      // URLs de producción del panel de admin (Vercel u otro hosting)
      'https://agua-dc.vercel.app',
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id', 'x-device-fingerprint'],
    credentials: true,
  });

  nestApp.setGlobalPrefix('api');

  // Registrar el filtro de excepciones global
  nestApp.useGlobalFilters(new AllExceptionsFilter());

  nestApp.useGlobalPipes(new CustomValidationPipe());

  // ─── Documentación Swagger ────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('AguaDC API')
    .setDescription('La API oficial para consultar la calendarización de racionamiento de AguaDC')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('schedules')
    .addTag('reports')
    .addTag('auth')
    .build();

  const document = SwaggerModule.createDocument(nestApp, config);
  SwaggerModule.setup('api/docs', nestApp, document);

  await nestApp.init();
  logger.log('AguaDC API inicializada');
  logger.log('Swagger UI disponible en: http://0.0.0.0:' + (process.env.PORT || 3000) + '/api/docs');
  return nestApp;
}

// ─── Bootstrap estándar (Railway, Docker, desarrollo local) ──────────────────
// Punto de entrada principal cuando se ejecuta con `node dist/main`.
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await createNestServer();
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`AguaDC API corriendo en: http://0.0.0.0:${port}/api`);
}

// ─── Handler para Vercel (serverless) ────────────────────────────────────────
// Exportado como default para que api/server.js lo cargue en Vercel.
export default async (req: Request, res: Response) => {
  await createNestServer();
  expressApp(req, res);
};

// ─── Arranque del servidor HTTP ───────────────────────────────────────────────
// En Vercel el runtime importa el handler exportado arriba y nunca llega aquí.
// En Railway/Docker este bloque inicia el servidor en el puerto configurado.
if (!process.env.VERCEL) {
  bootstrap();
}
