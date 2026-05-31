'use server';
/**
 * @fileOverview A Genkit flow for generating job descriptions based on keywords or prompts.
 *
 * - generateJobDescription - A function that generates a detailed job description.
 * - GenerateJobDescriptionInput - The input type for the generateJobDescription function.
 * - GenerateJobDescriptionOutput - The return type for the generateJobDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateJobDescriptionInputSchema = z.object({
  keywordsOrPrompt: z.string().describe('Keywords or a short prompt to generate the job description.'),
});
export type GenerateJobDescriptionInput = z.infer<typeof GenerateJobDescriptionInputSchema>;

const GenerateJobDescriptionOutputSchema = z.object({
  jobDescription: z.string().describe('The generated detailed and compelling job description.'),
});
export type GenerateJobDescriptionOutput = z.infer<typeof GenerateJobDescriptionOutputSchema>;

export async function generateJobDescription(input: GenerateJobDescriptionInput): Promise<GenerateJobDescriptionOutput> {
  return generateJobDescriptionFlow(input);
}

const generateJobDescriptionPrompt = ai.definePrompt({
  name: 'generateJobDescriptionPrompt',
  input: { schema: GenerateJobDescriptionInputSchema },
  output: { schema: GenerateJobDescriptionOutputSchema },
  prompt: `You are an expert job description writer. Your task is to create a detailed and compelling job description based on the following information provided by an employer. Focus on attracting suitable candidates quickly and accurately.

Input: {{{keywordsOrPrompt}}}

Please provide a job description that includes:
- Job Title
- Company Overview (brief, optional)
- Job Summary
- Responsibilities (detailed bullet points)
- Qualifications (required and preferred bullet points)
- Benefits (optional, but good to include if relevant)
- Call to Action

Format the output as a JSON object with a single field named 'jobDescription'.`,
});

const generateJobDescriptionFlow = ai.defineFlow(
  {
    name: 'generateJobDescriptionFlow',
    inputSchema: GenerateJobDescriptionInputSchema,
    outputSchema: GenerateJobDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await generateJobDescriptionPrompt(input);
    return output!;
  }
);
