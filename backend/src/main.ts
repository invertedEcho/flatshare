import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import firebaseAdmin from 'firebase-admin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(3000, '0.0.0.0');

  if (firebaseAdmin.apps.length === 0) {
    const firebaseServiceAccountJsonContent =
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON_CONTENT;

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
  }

  const appUrl = await app.getUrl();
  console.log(`Flatshare Backend is running on: ${appUrl}`);
}
bootstrap();
