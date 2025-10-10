
'use server';
/**
 * @fileoverview This file initializes the Genkit AI instance with necessary plugins.
 * It exports a single `ai` object that should be used throughout the application
 * for defining flows, prompts, and other Genkit functionalities.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit with the Google AI plugin.
// This makes Google's models (like Gemini) available for use in flows.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // We recommend using `logLevel: 'debug'` for development
  // to get detailed logging of Genkit operations.
  // logLevel: 'debug', 
  // Omitted for production to avoid verbose logs.
});
