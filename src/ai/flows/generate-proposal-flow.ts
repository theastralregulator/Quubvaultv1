'use server';
/**
 * @fileOverview An AI assistant that helps workers draft tailored job proposals or cover letters.
 *
 * - generateProposal - A function that handles the proposal generation process.
 * - GenerateProposalInput - The input type for the generateProposal function.
 * - GenerateProposalOutput - The return type for the generateProposal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProposalInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The detailed description of the job the worker is applying for.'),
  workerProfile: z
    .string()
    .describe(
      "The worker's professional profile, including skills, experience, and accomplishments."
    ),
});
export type GenerateProposalInput = z.infer<typeof GenerateProposalInputSchema>;

const GenerateProposalOutputSchema = z.object({
  proposal: z
    .string()
    .describe(
      'A tailored job proposal or cover letter drafted for the worker based on the job description and their profile.'
    ),
});
export type GenerateProposalOutput = z.infer<typeof GenerateProposalOutputSchema>;

export async function generateProposal(
  input: GenerateProposalInput
): Promise<GenerateProposalOutput> {
  return generateProposalFlow(input);
}

const generateProposalPrompt = ai.definePrompt({
  name: 'generateProposalPrompt',
  input: {schema: GenerateProposalInputSchema},
  output: {schema: GenerateProposalOutputSchema},
  prompt: `You are an AI assistant specialized in drafting compelling job proposals and cover letters.
Your goal is to help a worker create a tailored application for a specific job.

Use the provided worker's professional profile and the job description to draft a professional, engaging, and highly relevant proposal or cover letter.
Highlight how the worker's skills and experience directly address the requirements and responsibilities outlined in the job description.
The proposal should be clear, concise, and persuasive.

---
Job Description:
{{{jobDescription}}}

---
Worker's Professional Profile:
{{{workerProfile}}}

---
Draft a tailored proposal/cover letter below:`,
});

const generateProposalFlow = ai.defineFlow(
  {
    name: 'generateProposalFlow',
    inputSchema: GenerateProposalInputSchema,
    outputSchema: GenerateProposalOutputSchema,
  },
  async input => {
    const {output} = await generateProposalPrompt(input);
    return output!;
  }
);
