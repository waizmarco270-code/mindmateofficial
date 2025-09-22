
'use server';
/**
 * @fileOverview An AI flow for generating flashcards from a given text or topic.
 * 
 * - generateFlashcards - A function that handles the flashcard generation process.
 * - FlashcardGeneratorInput - The input type for the generateFlashcards function.
 * - FlashcardGeneratorOutput - The return type for the generateFlashcards function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { defineFlow, definePrompt } from 'genkit';

const FlashcardSchema = z.object({
    front: z.string().describe("The question or term for the front of the flashcard."),
    back: z.string().describe("The answer or definition for the back of the flashcard."),
});

export const FlashcardGeneratorInputSchema = z.object({
  topic: z.string().describe("The text or topic to generate flashcards from."),
  count: z.number().int().positive().describe("The number of flashcards to generate."),
});
export type FlashcardGeneratorInput = z.infer<typeof FlashcardGeneratorInputSchema>;


export const FlashcardGeneratorOutputSchema = z.object({
    cards: z.array(FlashcardSchema),
});
export type FlashcardGeneratorOutput = z.infer<typeof FlashcardGeneratorOutputSchema>;

// Exported wrapper function
export async function generateFlashcards(input: FlashcardGeneratorInput): Promise<FlashcardGeneratorOutput> {
  return generateFlashcardsFlow(input);
}

// Define the prompt
const flashcardPrompt = definePrompt({
  name: 'flashcardPrompt',
  input: { schema: FlashcardGeneratorInputSchema },
  output: { schema: FlashcardGeneratorOutputSchema },
  prompt: `You are an expert at creating study materials. Based on the following text, generate exactly {{{count}}} flashcards. Each flashcard should have a clear, concise question (front) and a direct answer (back). The questions should be effective for studying and memorization.

Topic/Text:
{{{topic}}}
`,
});

// Define the flow
const generateFlashcardsFlow = defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: FlashcardGeneratorInputSchema,
    outputSchema: FlashcardGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await flashcardPrompt(input);
    if (!output) {
      throw new Error("AI failed to generate flashcards.");
    }
    return output;
  }
);
