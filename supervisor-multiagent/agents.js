import { sendEmail, createCalendarEvent, getContact,getAvailableTimeSlots } from './base-tools.js';
import { EMAIL_AGENT_PROMPT, CALENDAR_AGENT_PROMPT, CONTACT_AGENT_PROMPT } from './constant-prompt.js';
import { createAgent, humanInTheLoopMiddleware } from "langchain";
import { ChatOpenAI } from '@langchain/openai';
import { MemorySaver } from "@langchain/langgraph";




export const model = new ChatOpenAI({
    model: "gpt-5-mini-2025-08-07",
    temperature: 1,
    apiKey: process.env.OPENAI_API_KEY,
});



export const emailAgent = createAgent({
  model: model,
  tools: [sendEmail],
  systemPrompt: EMAIL_AGENT_PROMPT,
  checkpointer: new MemorySaver(),
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        send_email: {
          allowedDecisions: ["approve", "edit", "reject"],
          defaultDecision: false,
          description: "Email approval request. Pending for approval.",
        }
      }
    })
  ]
});


export const calendarAgent = createAgent({
  model: model,
  tools: [createCalendarEvent, getAvailableTimeSlots],
  systemPrompt: CALENDAR_AGENT_PROMPT,
  checkpointSaver: new MemorySaver(),
});


export const contactAgent = createAgent({
  model: model,
  tools: [getContact],
  systemPrompt: CONTACT_AGENT_PROMPT,
});