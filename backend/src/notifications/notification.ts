import { Message, getMessaging } from 'firebase-admin/messaging';

export async function sendFirebaseMessages({
  messages,
}: {
  messages: Message[];
}) {
  if (messages.length === 0) {
    return;
  }

  const messaging = getMessaging();

  // TODO: all tokens that error because they are no longer registered should be removed from our table.
  await messaging.sendEach(messages);
}
