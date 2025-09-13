
'use server';
/**
 * @fileOverview This flow generates a complete quiz based on a given topic.
 *
 * - generateQuiz - A function that takes a topic and returns a structured quiz object.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuizQuestionSchema = z.object({
  text: z.string().describe('The quiz question text.'),
  options: z.array(z.string()).min(4).max(4).describe('An array of exactly 4 possible answers.'),
  correctAnswer: z.string().describe('The correct answer from the options array.'),
});

export const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  numberOfQuestions: z.number().min(1).max(20).describe('The number of questions to generate for the quiz.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

export const GenerateQuizOutputSchema = z.object({
  title: z.string().describe('A creative and engaging title for the quiz related to the topic.'),
  category: z.string().describe('A suitable category for the quiz (e.g., "Science", "History", "Anime").'),
  questions: z.array(QuizQuestionSchema).describe('An array of quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateQuizPrompt',
    input: { schema: GenerateQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    prompt: `You are an expert quiz creator. Your task is to generate a challenging and engaging multiple-choice quiz based on the provided topic.

    Topic: {{{topic}}}
    Number of Questions: {{{numberOfQuestions}}}

    Please ensure the following:
    1.  Create a creative and relevant title for the quiz.
    2.  Assign a simple, one-word category for the quiz.
    3.  Generate exactly {{{numberOfQuestions}}} questions.
    4.  For each question, provide exactly 4 distinct options.
    5.  For each question, clearly identify the correct answer, ensuring it is one of the provided options.
    6.  The questions should be clear, well-formed, and factually accurate.
    `,
});


const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
