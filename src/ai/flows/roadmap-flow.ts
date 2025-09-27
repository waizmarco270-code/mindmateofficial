'use server';
/**
 * @fileOverview An AI flow for generating personalized study roadmaps.
 *
 * - generateRoadmap - A function that creates a structured study plan based on a user's goal.
 * - GenerateRoadmapInput - The input type for the generateRoadmap function.
 * - GenerateRoadmapOutput - The return type for the generateRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// --- SCHEMA DEFINITIONS ---

const TaskSchema = z.object({
  id: z.string().describe("A unique identifier for the task, e.g., 'task-1629...-0'"),
  text: z.string().describe("A concise, actionable description of the task."),
  completed: z.boolean().default(false).describe("The completion status of the task."),
});

const CategorySchema = z.object({
  id: z.string().describe("A unique identifier for the category, e.g., 'cat-1629...'"),
  title: z.string().describe("The title of the task category (e.g., 'Thermodynamics', 'Algebra')."),
  color: z.string().describe("A hex color code for the category (e.g., '#ef4444')."),
  tasks: z.array(TaskSchema).describe("A list of tasks within this category."),
});

const MilestoneSchema = z.object({
  day: z.number().int().positive().describe("The specific day number for this milestone in the roadmap."),
  categories: z.array(CategorySchema).describe("An array of task categories for this day."),
});

export const GenerateRoadmapInputSchema = z.object({
  goal: z.string().describe("The user's high-level study goal (e.g., 'Master calculus for JEE Mains')."),
  duration: z.number().int().positive().describe("The total number of days the user has to achieve the goal."),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

export const GenerateRoadmapOutputSchema = z.object({
  milestones: z.array(MilestoneSchema).describe("A complete, day-by-day study plan."),
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;


// --- PUBLIC WRAPPER FUNCTION ---

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}


// --- GENKIT PROMPT & FLOW ---

const categoryColors = [
    '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899'
];

const roadmapPrompt = ai.definePrompt({
  name: 'roadmapPrompt',
  input: { schema: GenerateRoadmapInputSchema },
  output: { schema: GenerateRoadmapOutputSchema },
  prompt: `You are an expert academic planner specializing in creating structured, actionable study roadmaps for students. Your task is to take a user's goal and a given duration, and break it down into a detailed, day-by-day plan.

**User's Goal:** {{{goal}}}
**Total Duration:** {{{duration}}} days

**Your Instructions:**
1.  **Analyze the Goal:** Understand the core subjects, topics, and the level of depth required (e.g., board exams vs. competitive exams like JEE/NEET).
2.  **Structure the Plan:** Distribute the topics logically over the entire duration. Create milestones for each day that has planned tasks. Do NOT create milestones for empty rest days.
3.  **Create Daily Categories:** For each day, group tasks into logical categories (e.g., a specific chapter, a subject like 'Physics', or a skill like 'Problem Solving').
4.  **Generate Actionable Tasks:** Within each category, create a few (2-4) specific, small, and actionable tasks. For example, instead of "Study Thermodynamics," use tasks like "Read notes on Zeroth Law," "Solve 10 numericals on Carnot engines," or "Revise concepts of entropy."
5.  **Assign Colors:** For each category, assign a random but appropriate hex color code from the provided list: ${categoryColors.join(', ')}. Try to keep the color consistent for the same category title if it appears on different days.
6.  **Unique IDs:** Ensure every task and category has a unique ID string. You can use a simple format like 'task-{{@index}}' or a timestamp-based one. The day number itself is the ID for the milestone.
7.  **Pacing:** Incorporate rest days or lighter days, especially in longer plans. Not every day needs to have tasks. A milestone should only be generated for days with planned activities.
8.  **Output Format:** You MUST return the plan in the specified JSON format, adhering strictly to the output schema.

**Example for a 3-day plan for 'Learn Basic Algebra':**
Day 1: Category 'Linear Equations' with tasks like 'Understand slope-intercept form' and 'Solve 5 practice problems'.
Day 2: Category 'Quadratic Equations' with tasks...
Day 3: Rest day (no milestone generated).

Now, generate the complete study roadmap for the user's goal.`,
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async (input) => {
    const { output } = await roadmapPrompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a roadmap. Please try again.");
    }
    
    // Post-processing to ensure unique IDs, as the model might not always do this perfectly.
    output.milestones.forEach(milestone => {
      milestone.categories.forEach((category, catIndex) => {
        category.id = `cat-${milestone.day}-${catIndex}-${Date.now()}`;
        category.tasks.forEach((task, taskIndex) => {
          task.id = `task-${milestone.day}-${catIndex}-${taskIndex}-${Date.now()}`;
        });
      });
    });
    
    return output;
  }
);
