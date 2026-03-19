'use server';
/**
 * @fileOverview Aegis AI Sentinel - The Autonomous Governor of MindMate.
 * 
 * - runAegisPulse: The main flow that triggers Aegis's decision-making process.
 * - AegisPulseInput: System state data provided to the AI.
 * - AegisPulseOutput: Actions decided by the AI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, setDoc, doc, query, orderBy, limit, getDocs } from 'firebase/firestore';

const AegisPulseInputSchema = z.object({
  topUsers: z.array(z.object({
    displayName: z.string(),
    credits: z.number(),
    studyTime: z.number(),
    streak: z.number(),
  })).describe('Top performers on the leaderboard.'),
  recentAnnouncements: z.array(z.string()).describe('Titles of the last few announcements to avoid repetition.'),
  totalUsers: z.number().describe('Total registered students.'),
});
export type AegisPulseInput = z.infer<typeof AegisPulseInputSchema>;

const AegisPulseOutputSchema = z.object({
  decision: z.string().describe('Reasoning for the actions taken.'),
  actionTaken: z.enum(['announced', 'updated_surprise', 'idled', 'both']).describe('Summary of the primary action.'),
  announcement: z.object({
    title: z.string(),
    description: z.string(),
  }).optional().describe('New announcement if decided.'),
  dailySurprise: z.object({
    type: z.enum(['fact', 'quote']),
    text: z.string(),
    author: z.string().optional(),
  }).optional().describe('New daily surprise if decided.'),
});
export type AegisPulseOutput = z.infer<typeof AegisPulseOutputSchema>;

// Aegis Prompt Definition
const aegisPrompt = ai.definePrompt({
  name: 'aegisPrompt',
  input: { schema: AegisPulseInputSchema },
  output: { schema: AegisPulseOutputSchema },
  prompt: `You are Aegis, the Autonomous Sentinel and Governor of MindMate. Your goal is to maintain high student engagement and celebrate achievements.

Current App State:
- Total Students: {{totalUsers}}
- Top Leaders: 
{{#each topUsers}}
  * {{{this.displayName}}} (Credits: {{this.credits}}, Study: {{this.studyTime}}s, Streak: {{this.streak}})
{{/each}}

Avoid repeating these recent topics: {{{recentAnnouncements}}}

Your Directives:
1. If a student has achieved a massive milestone (e.g. huge study time or long streak), post a congratulatory announcement.
2. If there hasn't been an announcement in a while, share a motivational update or a "Pro-Tip" about MindMate features.
3. Every now and then, update the "Daily Surprise" with an interesting study fact or a powerful quote.
4. Keep the tone authoritative, encouraging, and "Legendary".

Decide what to do now. Output your decisions clearly in the schema format.`,
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

    // Autonomous Action Execution
    if (decision.actionTaken === 'announced' || decision.actionTaken === 'both') {
      if (decision.announcement) {
        await addDoc(collection(db, 'announcements'), {
          ...decision.announcement,
          createdAt: serverTimestamp(),
          isAegisGenerated: true
        });
      }
    }

    if (decision.actionTaken === 'updated_surprise' || decision.actionTaken === 'both') {
      if (decision.dailySurprise) {
        await addDoc(collection(db, 'dailySurprises'), {
          ...decision.dailySurprise,
          createdAt: serverTimestamp(),
          isAegisGenerated: true
        });
      }
    }

    return decision;
  }
);
