import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-skills-flow.ts';
import '@/ai/flows/generate-job-description-flow.ts';
import '@/ai/flows/generate-proposal-flow.ts';
import '@/ai/flows/recommendation-flow.ts';