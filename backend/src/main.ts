import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(3000, '0.0.0.0');

  const firebaseConfig = {
    apiKey: 'AIzaSyCT8eDkbJH3fMYuGbZN_0q0IBwYREL6NC0',
    authDomain: 'flatshare-223fd.firebaseapp.com',
    projectId: 'flatshare-223fd',
    storageBucket: 'flatshare-223fd.firebasestorage.app',
    messagingSenderId: '66431485841',
    appId: '1:66431485841:web:b5e54ac058eba7920fbc30',
  };

  const firebaseApp = initializeApp(firebaseConfig);

  const appUrl = await app.getUrl();
  console.log(`Flatshare Backend is running on: ${appUrl}`);
}
bootstrap();
