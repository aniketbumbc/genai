import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';

/** to get env variable
 * Open ai env variable
 *
 */
dotenv.config();

export const modelWriter = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});
