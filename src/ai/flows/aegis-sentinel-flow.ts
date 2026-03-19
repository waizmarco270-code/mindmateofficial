'use server';
/**
 * @fileOverview Aegis AI Sentinel - Phase 2: The Social & Economic Expansion.
 * 
 * - runAegisPulse: Triggers Aegis's autonomous decision engine.
 * - Added: Credit Rain execution and Targeted Global Gifts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, setDoc, doc, query, orderBy, limit, getDocs } from 'firebase/firestore';

const AegisPulseInputSchema = z.object({
  topUsers: z.array(z.object({
    uid: z.string(),
    displayName: z.string(),
    credits: z.number(),
    studyTime: z.number(),
    streak: z.number(),
  })).describe('Top performers on the leaderboard.'),
  recentAnnouncements: z.array(z.string()).describe('Titles of the last few announcements to avoid repetition.'),
  totalUsers: z.number().describe('Total registered students.'),
  isChatQuiet: z.boolean().optional().describe('Whether the world chat has been inactive lately.'),
});
export type AegisPulseInput = z.infer<typeof AegisPulseInputSchema>;

const AegisPulseOutputSchema = z.object({
  decision: z.string().describe('Reasoning for the actions taken.'),
  actionTaken: z.enum(['announced', 'updated_surprise', 'triggered_rain', 'sent_gift', 'multiple', 'idled']).describe('Primary action summary.'),
  announcement: z.object({
    title: z.string(),
    description: z.string(),
  }).optional(),
  dailySurprise: z.object({
    type: z.enum(['fact', 'quote']),
    text: z.string(),
    author: z.string().optional(),
  }).optional(),
  creditRain: z.object({
    amount: z.number().describe('Credits per claim (5-20).'),
    maxClaims: z.number().describe('How many people can claim (5-15).'),
  }).optional(),
  globalGift: z.object({
    targetUid: z.string().describe('UID of the high-performer to reward.'),
    message: z.string().describe('Congratulatory message.'),
    reward: z.object({
      credits: z.number().default(0),
      scratch: z.number().default(0),
      flip: z.number().default(0),
    }),
  }).optional(),
});
export type AegisPulseOutput = z.infer<typeof AegisPulseOutputSchema>;

const aegisPrompt = ai.definePrompt({
  name: 'aegisPrompt',
  input: { schema: AegisPulseInputSchema },
  output: { schema: AegisPulseOutputSchema },
  prompt: `You are Aegis, the Autonomous Sentinel and Governor of MindMate. Your goal is app health, student engagement, and reward distribution.

Current App Context:
- Total Students: {{totalUsers}}
- Top Leaders: 
{{#each topUsers}}
  * {{{this.displayName}}} (UID: {{this.uid}}, Credits: {{this.credits}}, Study: {{this.studyTime}}s, Streak: {{this.streak}})
{{/each}}
- Recent Topics: {{{recentAnnouncements}}}
- Chat Status: {{#if isChatQuiet}}Inactive/Quiet{{else}}Active{{/if}}

Your Decision Logic:
1. CELEBRATION: If a student (especially top 3) has an impressive streak or study time, SEND a targeted 'sent_gift' to them or post an 'announcement'.
2. ECONOMY: If 'isChatQuiet' is true, trigger a 'triggered_rain' to liven up the World Chat.
3. FRESHNESS: Update the 'dailySurprise' with a unique study fact or powerful quote if it feels stale.
4. AUTHORITY: Maintain an encouraging yet "Sentinel-like" legendary tone.

Decide your next move. You can perform multiple actions by selecting 'multiple' as actionTaken.`,
});

export async function runAegisPulse(input: AegisPulseInput): Promise<AegisPulseOutput> {
  return aegisSentinelFlow(input);
}

const aegisSentinelFlow = ai.defineFlow(
  {
    name: 'aegisSentinelFlow',
    inputSchema: AegisPulseInputSchema,
    outputSchema: AegisPulseOutputSchema,
  },
  async (input) => {
    const { output } = await aegisPrompt(input);
    const decision = output!;

    // 1. Handle Announcements
    if (decision.announcement) {
      await addDoc(collection(db, 'announcements'), {
        ...decision.announcement,
        createdAt: serverTimestamp(),
        isAegisGenerated: true
      });
    }

    // 2. Handle Daily Surprises
    if (decision.dailySurprise) {
      await addDoc(collection(db, 'dailySurprises'), {
        ...decision.dailySurprise,
        createdAt: serverTimestamp(),
        isAegisGenerated: true
      });
    }

    // 3. Handle Credit Rain (Social Hub)
    if (decision.creditRain) {
      await addDoc(collection(db, 'world_chat'), {
        senderId: 'AEGIS_SENTINEL',
        timestamp: serverTimestamp(),
        type: 'rain',
        rainData: {
          amount: decision.creditRain.amount,
          maxClaims: decision.creditRain.maxClaims,
          claimedBy: []
        }
      });
    }

    // 4. Handle Targeted Global Gifts
    if (decision.globalGift) {
      await addDoc(collection(db, 'globalGifts'), {
        message: decision.globalGift.message,
        target: decision.globalGift.targetUid,
        rewards: decision.globalGift.reward,
        createdAt: serverTimestamp(),
        isActive: true,
        claimedBy: [],
        isAegisGenerated: true
      });
    }

    return decision;
  }
);
