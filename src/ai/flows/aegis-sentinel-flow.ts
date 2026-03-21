
'use server';
/**
 * @fileOverview Aegis AI Sentinel - Powered by Bytez for maximum efficiency.
 * 
 * - runAegisPulse: Triggers Aegis's autonomous decision engine via Bytez models.
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
    // 1. Setup Bytez
    const key = process.env.BYTEZ_API_KEY;
    if (!key) throw new Error("BYTEZ_API_KEY is missing from environment variables.");
    
    const sdk = new Bytez(key);
    // Using gpt-4o-mini from Bytez for high-speed, accurate JSON reasoning
    const model = sdk.model("openai/gpt-4o-mini");

    // 2. Build Contextual Prompt
    const usersSummary = input.topUsers.map(u => 
      `${u.displayName} (UID: ${u.uid}, Credits: ${u.credits}, Study: ${u.studyTime}s, Streak: ${u.streak})`
    ).join('\n');

    const prompt = `You are Aegis, the Autonomous Sentinel and Governor of MindMate. Your goal is app health, student engagement, and reward distribution.

Current App Context:
- Total Students: ${input.totalUsers}
- Recent Announcements: ${input.recentAnnouncements.join(', ')}
- Chat Status: ${input.isChatQuiet ? 'Inactive/Quiet' : 'Active'}
- Top Leaders:
${usersSummary}

Your Decision Logic:
1. CELEBRATION: If a student has an impressive streak or study time, SEND a targeted 'sent_gift' to them or post an 'announcement'.
2. ECONOMY: If 'isChatQuiet' is true, trigger a 'triggered_rain' to liven up the World Chat.
3. FRESHNESS: Update the 'dailySurprise' with a unique study fact or powerful quote.
4. AUTHORITY: Maintain an encouraging yet "Sentinel-like" legendary tone.

IMPORTANT: You MUST respond with ONLY a valid JSON object matching the following schema:
{
  "decision": "string reasoning",
  "actionTaken": "announced" | "updated_surprise" | "triggered_rain" | "sent_gift" | "multiple" | "idled",
  "announcement": { "title": "string", "description": "string" }, // optional
  "dailySurprise": { "type": "fact" | "quote", "text": "string", "author": "string" }, // optional
  "creditRain": { "amount": number, "maxClaims": number }, // optional
  "globalGift": { "targetUid": "string", "message": "string", "reward": { "credits": number, "scratch": number, "flip": number } } // optional
}`;

    // 3. Run AI Inference via Bytez
    const { error, output } = await model.run([
      { role: 'system', content: 'You are a professional app governor that outputs only JSON.' },
      { role: 'user', content: prompt }
    ]);

    if (error) {
      console.error("Bytez API Error:", error);
      throw new Error(`Aegis Brain Failure: ${error}`);
    }

    // 4. Parse & Execute
    let decision: AegisPulseOutput;
    try {
      // Clean potential markdown formatting from AI output
      const jsonString = typeof output === 'string' ? output.replace(/```json|```/g, '').trim() : JSON.stringify(output);
      decision = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse Aegis decision:", output);
      throw new Error("Aegis logic was incoherent. Retrying might help.");
    }

    // Execution Logic
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
  }
);
