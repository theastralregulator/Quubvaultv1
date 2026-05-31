'use server';
/**
 * @fileOverview An AI agent that suggests skill tags based on a free-text description.
 *
 * - suggestSkills - A function that handles the skill suggestion process.
 * - SuggestSkillsInput - The input type for the suggestSkills function.
 * - SuggestSkillsOutput - The return type for the suggestSkills function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestSkillsInputSchema = z.object({
  description: z.string().describe('A free-text description of a job or worker profile.'),
});
export type SuggestSkillsInput = z.infer<typeof SuggestSkillsInputSchema>;

const SuggestSkillsOutputSchema = z.object({
  skills: z.array(z.string()).describe('An array of relevant skill tags.'),
});
export type SuggestSkillsOutput = z.infer<typeof SuggestSkillsOutputSchema>;

export async function suggestSkills(input: SuggestSkillsInput): Promise<SuggestSkillsOutput> {
  return suggestSkillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSkillsPrompt',
  input: { schema: SuggestSkillsInputSchema },
  output: { schema: SuggestSkillsOutputSchema },
  prompt: `You are an expert at identifying relevant skill tags from free-text descriptions.

Based on the following description, provide a list of relevant skill tags. Focus on technical skills, soft skills, and relevant industry knowledge. The skills should be concise, typically one to three words.

Description: {{{description}}}`,
});

const suggestSkillsFlow = ai.defineFlow(
  {
    name: 'suggestSkillsFlow',
    inputSchema: SuggestSkillsInputSchema,
    outputSchema: SuggestSkillsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
