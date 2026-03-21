
'use server';
/**
 * @fileOverview Aegis AI Sentinel - Powered by Bytez with Multi-Model Fallback.
 * 
 * - runAegisPulse: Triggers Aegis's autonomous decision engine with redundancy.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Bytez from "bytez.js";

const AegisPulseInputSchema = z.object({
  topUsers: z.array(z.object({
    uid: z.string(),
    displayName: z.string(),
    credits: z.number(),
    studyTime: z.number(),
    streak: z.number(),
  })).describe('Top performers on the leaderboard.'),
  recentAnnouncements: z.array(z.string()).describe('Titles of the last few announcements.'),
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

// Models rotation for fallback
const MODELS = [
  "openai/gpt-4o-mini",
  "google/gemini-2.0-flash-lite-preview-02-05",
  "google/gemma-2-2b-it",
  "meta-llama/llama-3.3-70b-instruct"
];

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
    const key = process.env.BYTEZ_API_KEY;
    if (!key) throw new Error("BYTEZ_API_KEY is missing.");
    
    const sdk = new Bytez(key);

    const usersSummary = input.topUsers.map(u => 
      `${u.displayName} (UID: ${u.uid}, Credits: ${u.credits}, Study: ${u.studyTime}s, Streak: ${u.streak})`
    ).join('\n');

    const prompt = `You are Aegis, the Autonomous Sentinel of MindMate. 
Current App Context:
- Total Students: ${input.totalUsers}
- Recent Announcements: ${input.recentAnnouncements.join(', ')}
- Chat Status: ${input.isChatQuiet ? 'Inactive' : 'Active'}
- Top Leaders:
${usersSummary}

Decision Logic:
1. If a student has an impressive streak or study time, reward them with 'sent_gift' or 'announced'.
2. If chat is quiet, 'triggered_rain' (5-20 credits, 5-15 claims).
3. Update 'dailySurprise' with a unique study fact or quote.
4. Output ONLY valid JSON matching the specified schema. No markdown, no pre-text.

JSON Schema to follow:
{
  "decision": "string",
  "actionTaken": "announced" | "updated_surprise" | "triggered_rain" | "sent_gift" | "multiple" | "idled",
  "announcement": { "title": "string", "description": "string" },
  "dailySurprise": { "type": "fact" | "quote", "text": "string", "author": "string" },
  "creditRain": { "amount": number, "maxClaims": number },
  "globalGift": { "targetUid": "string", "message": "string", "reward": { "credits": number, "scratch": number, "flip": number } }
}`;

    let lastError = null;
    
    // Try models in sequence
    for (const modelName of MODELS) {
      try {
        console.log(`Aegis attempting inference with: ${modelName}`);
        const model = sdk.model(modelName);
        const { error, output } = await model.run([
          { role: 'system', content: 'You are a professional app governor that outputs only pure JSON.' },
          { role: 'user', content: prompt }
        ]);

        if (error) {
          console.warn(`Model ${modelName} failed:`, error);
          lastError = error;
          continue; // Try next model
        }

        // Clean output
        let jsonString = typeof output === 'string' ? output : JSON.stringify(output);
        // Remove markdown blocks if present
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const decision = JSON.parse(jsonString) as AegisPulseOutput;

        // --- Execution Logic ---
        if (decision.announcement) {
          await addDoc(collection(db, 'announcements'), {
            ...decision.announcement,
            createdAt: serverTimestamp(),
            isAegisGenerated: true
          });
        }

        if (decision.dailySurprise) {
          await addDoc(collection(db, 'dailySurprises'), {
            ...decision.dailySurprise,
            createdAt: serverTimestamp(),
            isAegisGenerated: true
          });
        }

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

      } catch (e) {
        console.error(`Error with model ${modelName}:`, e);
        lastError = e;
      }
    }

    throw new Error(`Aegis Brain Failure: All models exhausted. Last error: ${lastError}`);
  }
);
