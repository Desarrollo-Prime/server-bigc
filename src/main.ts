if (typeof global.crypto === 'undefined' || typeof global.crypto.randomUUID === 'undefined') {
  try {
    // Usar 'node:crypto' para referenciar explícitamente el módulo built-in de Node.js
    global.crypto = require('node:crypto');
  } catch (e) {
    console.warn("Failed to polyfill global.crypto. This might cause issues if 'crypto.randomUUID' is used by dependencies.", e);
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // Corrección aquí: Volver a la importación estática normal
import { ValidationPipe, HttpStatus, HttpException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  // Ya no es necesaria una importación dinámica aquí.
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir solicitudes desde el frontend
  app.enableCors({
    origin: '*', // En producción, especificar dominios permitidos, ej: 'http://localhost:3000'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Prefijo global para todas las rutas de la API
  app.setGlobalPrefix('api');

  // Habilitar ValidationPipe globalmente para validar DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remueve propiedades que no están definidas en los DTOs
    forbidNonWhitelisted: true, // Lanza un error si hay propiedades no permitidas
    transform: true, // Transforma los objetos de entrada a instancias de los DTOs
  }));

  // Servir archivos estáticos (documentos subidos)
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Configuración de Swagger (OpenAPI)
  const config = new DocumentBuilder()
    .setTitle('BIGC Document Management API')
    .setDescription('API para la gestión documental de BIGC')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Introduce tu token JWT aquí',
        in: 'header',
      },
      'JWT-auth', // Nombre de la seguridad para referenciar en los endpoints
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // La documentación estará en /api-docs

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger docs available at: ${await app.getUrl()}/api-docs`);
}
bootstrap();