//https://dev.to/krtirtho/nestjs-the-framework-of-nodejs-part-1-gl7
//https://ru-nestjs-docs.netlify.app/techniques/security

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { Logger } from '@nestjs/common';

import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
//import { useContainer } from 'class-validator';
//import { MongoExceptionFilter } from './shared/mongo-exception.filter';
import { HttpExceptionFilter } from './shared/filter';
//import * as csurf from 'csurf';
//import * as cookieParser from 'cookie-parser';
//import * as session from 'express-session';
//import express from 'express';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());

  //useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.use(helmet());
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Project prog-nest-auth')
    .setDescription('The Realworld API description')
    .setVersion('1.0')
    //.setBasePath('api')
    .addTag('user')
    //.addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const PORT = process.env.PORT || 4000;
  const PORT_MCRO = process.env.PORT_MCRO || 4010;
  const HOST_MCRO = process.env.HOST_MCRO || 'localhost';

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: HOST_MCRO,
      port: PORT_MCRO,
    },
  });
  await app.startAllMicroservices();

  await app.listen(PORT, () => {
    Logger.log(`Listening on PORT: ${PORT}`);
  });
}
bootstrap();
