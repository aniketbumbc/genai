import { EMAIL_AGENT_PROMPT, CALENDAR_AGENT_PROMPT, CONTACT_AGENT_PROMPT } from './constant-prompt.js';
import { createAgent } from "langchain";
import { ChatOpenAI } from '@langchain/openai';
import { sendEmail, createCalendarEvent, getContact,getAvailableTimeSlots } from './tools.js';




const model = new ChatOpenAI({
    model: "gpt-5-mini-2025-08-07",
    temperature: 1,
    apiKey: process.env.OPENAI_API_KEY,
});



export const emailAgent = createAgent({
  model: model,
  tools: [sendEmail],
  systemPrompt: EMAIL_AGENT_PROMPT,
});


export const calendarAgent = createAgent({
  model: model,
  tools: [createCalendarEvent, getAvailableTimeSlots],
  systemPrompt: CALENDAR_AGENT_PROMPT,
});


export const contactAgent = createAgent({
  model: model,
  tools: [getContact],
  systemPrompt: CONTACT_AGENT_PROMPT,
});