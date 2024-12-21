import { Message, getMessaging } from 'firebase-admin/messaging';
import firebaseAdmin from 'firebase-admin';

if (firebaseAdmin.apps.length === 0) {
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
}

export async function sendFirebaseMessages({
  messages,
}: {
  messages: Message[];
}) {
  if (messages.length === 0) {
    return;
  }

  const messaging = getMessaging();
  const response = await messaging.sendEach(messages);
  if (response.failureCount > 0) {
    console.error({ loc: JSON.stringify(response.responses) });
    throw new Error('Did not send all messages!');
  }
}
