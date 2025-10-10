
'use server';
/**
 * @fileOverview A flow to send push notifications to users.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { initializeApp, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();
const messaging = getMessaging();

const NotificationInputSchema = z.object({
  title: z.string().describe('The title of the notification.'),
  body: z.string().describe('The main content of the notification.'),
});

export type NotificationInput = z.infer<typeof NotificationInputSchema>;

export async function sendNotification(input: NotificationInput): Promise<{ success: boolean; error?: string }> {
  return notifyAllUsersFlow(input);
}

const notifyAllUsersFlow = ai.defineFlow(
  {
    name: 'notifyAllUsersFlow',
    inputSchema: NotificationInputSchema,
    outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
  },
  async (input) => {
    try {
      // 1. Get all FCM tokens from Firestore
      const tokensSnapshot = await db.collection('fcmTokens').get();
      if (tokensSnapshot.empty) {
        console.log('No FCM tokens found.');
        return { success: true }; // No one to notify, but not an error
      }

      const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

      // 2. Construct the notification message
      const message = {
        notification: {
          title: input.title,
          body: input.body,
        },
        webpush: {
          notification: {
            icon: '/logo.jpg', // URL to your app's icon
          },
          fcm_options: {
              link: '/dashboard' // This will open the dashboard when the notification is clicked
          }
        },
        tokens: tokens,
      };

      // 3. Send the message to all tokens
      const response = await messaging.sendMulticast(message);
      
      console.log(`${response.successCount} messages were sent successfully`);
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        console.log('List of tokens that caused failures: ' + failedTokens);
        // Here you could add logic to clean up invalid tokens from your database
      }
      
      return { success: true };

    } catch (error: any) {
      console.error('Error sending notifications:', error);
      return { success: false, error: error.message };
    }
  }
);
