import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import firebaseAdmin from 'firebase-admin';
import { applicationDefault } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(3000, '0.0.0.0');

  const firebaseApp = firebaseAdmin.initializeApp({
    credential: applicationDefault(),
  });

  const appUrl = await app.getUrl();
  console.log(`Flatshare Backend is running on: ${appUrl}`);
}
bootstrap();
