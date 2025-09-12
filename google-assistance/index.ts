import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { createCalenderEvent, getCalendarEvents } from './tool.js';

dotenv.config();

const tools: any = [createCalenderEvent, getCalendarEvents];

const llm = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
}).bindTools(tools);

console.log('Weleomce to google assistance');
