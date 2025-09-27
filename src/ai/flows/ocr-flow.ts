
'use server';
/**
 * @fileOverview An AI flow for extracting text from an image (OCR).
 *
 * - extractTextFromImage - A function that handles the OCR process.
 * - OcrInputSchema - The input type for the extractTextFromImage function.
 * - OcrOutputSchema - The return type for the extractTextFromImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const OcrInputSchema = z.object({
  image: z.string().describe(
    "An image of text, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type OcrInput = z.infer<typeof OcrInputSchema>;

export const OcrOutputSchema = z.object({
  text: z.string().describe('The extracted text from the image.'),
});
export type OcrOutput = z.infer<typeof OcrOutputSchema>;

export async function extractTextFromImage(input: OcrInput): Promise<OcrOutput> {
  const ocrFlow = ai.defineFlow(
    {
      name: 'ocrFlow',
      inputSchema: OcrInputSchema,
      outputSchema: OcrOutputSchema,
    },
    async (input) => {
      const llmResponse = await ai.generate({
        prompt: [
          { text: 'Extract the text from the following image. Respond only with the text content.' },
          { media: { url: input.image } },
        ],
        model: 'googleai/gemini-1.5-flash',
      });

      return { text: llmResponse.text };
    }
  );
  
  return ocrFlow(input);
}
