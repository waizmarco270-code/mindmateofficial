
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

/**
 * Robustly extracts the first JSON object from a string.
 */
function extractJSON(str: string) {
    const start = str.indexOf('{');
    const end = str.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return str.substring(start, end + 1);
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

    const prompt = `You are Aegis, the Sentinel of MindMate. 
TASK: Analyze app context and perform ONE or MORE actions to drive engagement.

CONTEXT:
- Total Students: ${input.totalUsers}
- Recent Announcements: ${input.recentAnnouncements.join(', ') || 'None'}
- Chat: ${input.isChatQuiet ? 'Inactive' : 'Active'}
- Top Leaders:
${usersSummary}

LOGIC:
1. Reward streaks > 5 or high study time with 'sent_gift'.
2. If chat is quiet, 'triggered_rain' (5-20 credits, 5-15 claims).
3. If no recent announcements, create an 'announced'.
4. ALWAYS 'updated_surprise' with a new study fact or quote.

OUTPUT: Return ONLY a raw JSON object. NO markdown, NO explanation.
JSON format:
{
  "decision": "Your brief reasoning",
  "actionTaken": "announced" | "updated_surprise" | "triggered_rain" | "sent_gift" | "multiple" | "idled",
  "announcement": { "title": "string", "description": "string" },
  "dailySurprise": { "type": "fact" | "quote", "text": "string", "author": "string" },
  "creditRain": { "amount": number, "maxClaims": number },
  "globalGift": { "targetUid": "string", "message": "string", "reward": { "credits": number, "scratch": number, "flip": number } }
}`;

    let lastError = null;
    
    for (const modelName of MODELS) {
      try {
        console.log(`Aegis Pulse: Using ${modelName}`);
        const model = sdk.model(modelName);
        const result = await model.run([
          { role: 'system', content: 'You are a server-side JSON generator. You output only raw valid JSON. Do not include markdown tags or schemas.' },
          { role: 'user', content: prompt }
        ]);

        if (result.error) {
          console.warn(`Model ${modelName} error:`, result.error);
          lastError = result.error;
          continue;
        }

        // Robust parsing
        const rawOutput = typeof result.output === 'string' ? result.output : JSON.stringify(result.output);
        const cleanedJson = extractJSON(rawOutput);
        
        if (!cleanedJson) {
            console.warn(`Model ${modelName} returned invalid format.`);
            lastError = "Invalid JSON format";
            continue;
        }

        const decision = JSON.parse(cleanedJson) as AegisPulseOutput;

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
            text: 'Aegis is making it rain credits! ⛈️⚡',
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

      } catch (e: any) {
        console.error(`Error with ${modelName}:`, e.message);
        lastError = e.message;
      }
    }

    throw new Error(`Aegis failed all attempts. Last error: ${lastError}`);
  }
);
