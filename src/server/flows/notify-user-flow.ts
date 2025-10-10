
'use server';
/**
 * @fileOverview A flow to send a push notification to a specific user.
 */

import { ai } from '@/server/genkit';
import { z } from 'zod';
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
  userId: z.string().describe('The UID of the user to notify.'),
  title: z.string().describe('The title of the notification.'),
  body: z.string().describe('The main content of the notification.'),
});

export type NotificationInput = z.infer<typeof NotificationInputSchema>;

export async function sendNotificationToUser(input: NotificationInput): Promise<{ success: boolean; error?: string }> {
  return notifyUserFlow(input);
}

const notifyUserFlow = ai.defineFlow(
  {
    name: 'notifyUserFlow',
    inputSchema: NotificationInputSchema,
    outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
  },
  async (input) => {
    try {
      // 1. Get all FCM tokens for the specific user from Firestore
      const tokensSnapshot = await db.collection('fcmTokens').where('userId', '==', input.userId).get();
      
      if (tokensSnapshot.empty) {
        console.log(`No FCM tokens found for user: ${input.userId}`);
        return { success: true }; // No one to notify, but not an error
      }

      const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
      
      if (tokens.length === 0) {
        return { success: true };
      }

      // 2. Construct the notification message
      const message = {
        notification: {
          title: input.title,
          body: input.body,
        },
        webpush: {
          notification: {
            icon: '/logo.jpg', // URL to your app's icon
            badge: '/logo.jpg', // A badge icon for some platforms
            tag: `reply-${input.userId}-${Date.now()}` // Unique tag to prevent stacking if needed
          },
          fcm_options: {
              link: '/dashboard/world' // This will open the world chat when the notification is clicked
          }
        },
        tokens: tokens,
      };

      // 3. Send the message to all tokens for that user
      const response = await messaging.sendEachForMulticast(message);
      
      console.log(`${response.successCount} messages were sent successfully to user ${input.userId}`);
      
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error(`Failed to send to token: ${tokens[idx]}`, resp.error);
          }
        });
        console.log('List of tokens that caused failures: ' + failedTokens);
        // Here you could add logic to clean up invalid tokens from your database
      }
      
      return { success: true };

    } catch (error: any) {
      console.error('Error sending notification to user:', error);
      return { success: false, error: error.message };
    }
  }
);
