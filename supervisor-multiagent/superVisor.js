import { createAgent } from "langchain";
import { scheduleEvent, manageEmail, constactSearch } from "./base-tools.js";
import { model } from "./agents.js";
import { MemorySaver } from "@langchain/langgraph";


const SUPERVISOR_PROMPT = `
You are a helpful personal assistant.
You can schedule calendar events and send emails take email address and name from the contact list.
The flow should be like this:
1. Get the contact information of the person who is in the team(engineering, sales, marketing, etc.).
2. Schedule a calendar event for the person who is in the team.
3. Send an email to the person who is in the team.
To send email and notificaiton you can use appropriate tools. 
Example: to find the contact information of the person who is in the team, you can use the contact_search tool and to send email you can use the send_email tool.
Important: When request involves multiple actions, you should use multiple tools in sequence. Make sure to use the tools in the correct order.
`.trim();

export const supervisorAgent = createAgent({
  model: model,
  tools: [scheduleEvent, manageEmail, constactSearch],
  systemPrompt: SUPERVISOR_PROMPT,
  checkpointSaver: new MemorySaver(),
});