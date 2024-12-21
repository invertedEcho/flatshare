import { Message, getMessaging } from 'firebase-admin/messaging';

export async function sendFirebaseMessages({
  messages,
}: {
  messages: Message[];
}) {
  const messaging = getMessaging();
  const response = await messaging.sendEach(messages);
  if (response.failureCount > 0) {
    console.error({ loc: JSON.stringify(response.responses) });
    throw new Error('Did not send all messages!');
  }
}
