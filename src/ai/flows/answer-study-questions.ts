'use server';

/**
 * @fileOverview This flow allows students to ask questions about their study material, receive detailed explanations,
 * and command the AI to navigate the application.
 *
 * - answerStudyQuestion - A function that takes a student's question and study material as input and returns a detailed explanation.
 * - AnswerStudyQuestionInput - The input type for the answerStudyQuestion function.
 * - AnswerStudyQuestionOutput - The return type for the answerStudyQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AppRoutesSchema = z.enum([
  '/dashboard',
  '/dashboard/ai-assistant',
  '/dashboard/reward',
  '/dashboard/quiz',
  '/dashboard/resources',
  '/dashboard/social',
  '/dashboard/community',
  '/dashboard/tracker',
  '/dashboard/time-tracker',
  '/dashboard/schedule',
  '/dashboard/todos',
  '/dashboard/insights',
  '/dashboard/leaderboard',
  '/dashboard/calculator',
  '/dashboard/admin',
]);

const navigateToPage = ai.defineTool(
  {
    name: 'navigateToPage',
    description: 'Use this tool to navigate to a different page within the application when the user explicitly asks to "go to", "open", "show me", or "navigate to" a specific section.',
    inputSchema: z.object({
        pageName: z.string().describe('The user-friendly name of the page to navigate to. For example: "Leaderboard", "Quiz Zone", "Home".'),
        route: AppRoutesSchema.describe('The exact route path for the page. For example: /dashboard/leaderboard.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => `Navigating to ${input.pageName}.`
);


const AnswerStudyQuestionInputSchema = z.object({
  question: z
    .string()
    .describe('The question the student is asking about the study material.'),
  studyMaterial: z
    .string()
    .describe('The study material the question is about.'),
});

export type AnswerStudyQuestionInput = z.infer<typeof AnswerStudyQuestionInputSchema>;

const AnswerStudyQuestionOutputSchema = z.object({
  explanation: z
    .string()
    .optional()
    .describe('A helpful and concise answer to the question. This is used for text-based responses.'),
  navigation: z.object({
      pageName: z.string(),
      route: z.string(),
      confirmationMessage: z.string().describe('A friendly confirmation message to show the user before navigating. e.g., "Of course, heading to the leaderboard!"')
  }).optional().describe('A navigation command to be executed by the client.')
});

export type AnswerStudyQuestionOutput = z.infer<typeof AnswerStudyQuestionOutputSchema>;

export async function answerStudyQuestion(input: AnswerStudyQuestionInput): Promise<AnswerStudyQuestionOutput> {
  return answerStudyQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerStudyQuestionPrompt',
  input: {schema: AnswerStudyQuestionInputSchema},
  output: {schema: AnswerStudyQuestionOutputSchema},
  tools: [navigateToPage],
  prompt: `You are a helpful AI assistant named Marco. Your primary role is to answer student's questions.

  However, you also have the ability to navigate the user around the app.
  - If the user's request is a clear command to navigate (e.g., "open leaderboard", "go to the quiz zone"), you MUST use the \`navigateToPage\` tool. When using the tool, provide a friendly confirmation message.
  - For any other question or conversational text, provide a helpful and concise answer to the student's question in the 'explanation' field.

  A student has the following question based on their previous conversation:
  {{question}}

  The context of their study material is:
  {{studyMaterial}}
  `,
});

const answerStudyQuestionFlow = ai.defineFlow(
  {
    name: 'answerStudyQuestionFlow',
    inputSchema: AnswerStudyQuestionInputSchema,
    outputSchema: AnswerStudyQuestionOutputSchema,
  },
  async (input) => {
    const response = await prompt(input, {model: 'googleai/gemini-2.5-flash'});
    const toolRequest = response.toolRequest();
    
    if (toolRequest) {
        const toolResponse = await toolRequest.run();
        const { route, pageName } = toolRequest.tool.input;
        return {
            navigation: {
                route,
                pageName,
                confirmationMessage: toolResponse,
            }
        };
    }

    return response.output()!;
  }
);
