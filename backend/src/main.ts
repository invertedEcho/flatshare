import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import firebaseAdmin from 'firebase-admin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(3000, '0.0.0.0');

  const firebaseServiceAccountJsonContent =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON_CONTENT;

  // TODO: should probably do the same for all other environment variables too.
  if (firebaseServiceAccountJsonContent === undefined) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON_CONTENT environment variable must be set.',
    );
  }

  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(
      JSON.parse(firebaseServiceAccountJsonContent),
    ),
  });

  const appUrl = await app.getUrl();
  console.log(`Flatshare Backend is running on: ${appUrl}`);
}
bootstrap();
