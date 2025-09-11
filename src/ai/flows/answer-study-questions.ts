
'use server';

/**
 * @fileOverview This flow allows students to ask questions about their study material, receive detailed explanations,
 * and command the AI to navigate the application or generate quick quizzes.
 *
 * - answerStudyQuestion - The main function for the AI assistant.
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

const QuizQuestionSchema = z.object({
  question: z.string().describe('The quiz question text.'),
  options: z.array(z.string()).describe('An array of 4 possible answers.'),
  correctAnswer: z.string().describe('The correct answer from the options array.'),
});

const generateQuickQuiz = ai.defineTool({
    name: 'generateQuickQuiz',
    description: "Generates a short, 1-2 question multiple-choice quiz about a specific topic to test the user's knowledge. Use this as a follow-up after providing an explanation.",
    inputSchema: z.object({
        topic: z.string().describe("The topic for the quiz, derived from the user's question or the previous explanation."),
    }),
    outputSchema: z.object({
      quiz: z.array(QuizQuestionSchema)
    })
  },
  async (input) => {
     const prompt = `Generate a short, challenging, 1-2 question multiple-choice quiz about the following topic: "${input.topic}". Each question should have 4 options. Format the output as a JSON object containing a "quiz" array, where each element has "question", "options", and "correctAnswer" keys.`;
     
     const {output} = await ai.generate({
        prompt: prompt,
        output: {
          schema: z.object({ quiz: z.array(QuizQuestionSchema) })
        }
     });

     return output!;
  }
);


const AnswerStudyQuestionInputSchema = z.object({
  question: z
    .string()
    .describe('The question the student is asking about the study material.'),
  studyMaterial: z
    .string()
    .describe('The study material the question is about.'),
  generateQuiz: z.boolean().optional().describe('If the user explicitly asks for a quiz on the current topic.')
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
  }).optional().describe('A navigation command to be executed by the client.'),
  quiz: z.array(QuizQuestionSchema).optional().describe('An array of quiz questions to be shown to the user.')
});

export type AnswerStudyQuestionOutput = z.infer<typeof AnswerStudyQuestionOutputSchema>;

export async function answerStudyQuestion(input: AnswerStudyQuestionInput): Promise<AnswerStudyQuestionOutput> {
  return answerStudyQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerStudyQuestionPrompt',
  input: {schema: AnswerStudyQuestionInputSchema},
  output: {schema: AnswerStudyQuestionOutputSchema},
  tools: [navigateToPage, generateQuickQuiz],
  prompt: `You are a helpful AI assistant named Marco. Your primary role is to answer student's questions.

  You have several tools you can use:
  - If the user's request is a clear command to navigate (e.g., "open leaderboard", "go to the quiz zone"), you MUST use the \`navigateToPage\` tool. When using the tool, provide a friendly confirmation message.
  - If the user explicitly asks for a quiz or to be tested on a topic, or if you have just provided a detailed explanation, you should use the \`generateQuickQuiz\` tool to create a short quiz.
  - For any other question or conversational text, provide a helpful and concise answer to the student's question in the 'explanation' field.

  A student has the following question based on their previous conversation:
  {{question}}
  
  {{#if generateQuiz}}
  The user is requesting a quiz on this topic. Use the \`generateQuickQuiz\` tool.
  {{/if}}

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

        // Handle navigation
        if (toolRequest.tool.name === 'navigateToPage') {
            const { route, pageName } = toolRequest.tool.input;
            return {
                navigation: {
                    route,
                    pageName,
                    confirmationMessage: toolResponse as string,
                }
            };
        }
        
        // Handle quiz generation
        if (toolRequest.tool.name === 'generateQuickQuiz') {
            return {
               quiz: (toolResponse as any).quiz
            };
        }
    }

    return response.output()!;
  }
);
