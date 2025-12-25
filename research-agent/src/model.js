import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';

dotenv.config();

export const llm = new ChatOpenAI({
  model: 'gpt-5-nano-2025-08-07',
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});
