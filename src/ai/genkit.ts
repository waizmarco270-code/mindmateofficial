
import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

// You can pass {logLevel: 'debug'} to see internal Genkit logs.
export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
});
