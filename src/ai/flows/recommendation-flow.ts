'use server';
/**
 * @fileOverview A Genkit flow for generating personalized recommendations for work or workers.
 *
 * - recommendRecommendations - A function that handles the recommendation process.
 * - RecommendationInput - The input type for the recommendRecommendations function.
 * - RecommendationOutput - The return type for the recommendRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendationInputSchema = z.object({
  userType: z.enum(['worker', 'employer']).describe('The type of user requesting recommendations (worker or employer).'),
  userProfile: z.object({
    name: z.string().describe('The name of the user.'),
    bio: z.string().describe('A brief biography or summary of the user.'),
    skills: z.array(z.string()).describe('A list of skills the user possesses or requires.'),
    location: z.string().describe('The user\'s current location.'),
    preferences: z.array(z.string()).describe('A list of explicit preferences (e.g., "remote work", "full-time", "frontend", "design").'),
    activity: z.array(z.string()).describe('A list of recent activities or interests (e.g., "recently viewed: Web Developer position", "applied to: UI/UX Designer").'),
  }).describe('The detailed profile of the user.'),
});
export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;

const RecommendationOutputSchema = z.object({
  recommendedItems: z.array(z.object({
    type: z.enum(['work', 'worker']).describe('The type of recommendation (work opportunity or worker profile).'),
    title: z.string().describe('A concise title for the recommended item.'),
    description: z.string().describe('A brief description of the recommended item.'),
    reasons: z.array(z.string()).describe('A list of reasons why this item is recommended to the user.'),
  })).describe('A list of personalized recommendations.'),
});
export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;

export async function recommendRecommendations(input: RecommendationInput): Promise<RecommendationOutput> {
  return recommendationFlow(input);
}

const recommendationPrompt = ai.definePrompt({
  name: 'recommendationPrompt',
  input: {schema: RecommendationInputSchema},
  output: {schema: RecommendationOutputSchema},
  prompt: `You are an intelligent recommendation engine for the freelance marketplace Quub.
Your task is to provide personalized recommendations for either 'work' opportunities or 'workers' based on the user's profile, preferences, and recent activity.

The user is a: {{{userType}}}

User Profile:
Name: {{{userProfile.name}}}
Bio: {{{userProfile.bio}}}
Skills: {{#each userProfile.skills}}- {{this}}
{{/each}}
Location: {{{userProfile.location}}}
Preferences: {{#each userProfile.preferences}}- {{this}}
{{/each}}
Activity: {{#each userProfile.activity}}- {{this}}
{{/each}}

Based on the provided information, generate a list of 3-5 highly relevant recommendations.
For each recommendation, specify its 'type' (either 'work' or 'worker'), a concise 'title', a brief 'description', and a few 'reasons' explaining why this recommendation is suitable.

Ensure the recommendations are tailored specifically to the user's needs and context.`,
});

const recommendationFlow = ai.defineFlow(
  {
    name: 'recommendationFlow',
    inputSchema: RecommendationInputSchema,
    outputSchema: RecommendationOutputSchema,
  },
  async (input) => {
    const {output} = await recommendationPrompt(input);
    return output!;
  }
);
