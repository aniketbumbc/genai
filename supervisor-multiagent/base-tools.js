import { tool } from "langchain";
import { z } from "zod";
import { emailAgent,calendarAgent,contactAgent } from "./agents.js";
import { CONTACT_LIST } from "./constant-prompt.js";


export const sendEmail = tool(
    async ({ to, subject, body, cc }) => {
      // Stub: In practice, this would call SendGrid, Gmail API, etc.
      return `Email sent to ${to.join(', ')} - Subject: ${subject}`;
    },
    {
      name: "send_email",
      description: "Send an email via email API. Requires properly formatted addresses.",
      schema: z.object({
        to: z.array(z.string()).describe("email addresses"),
        subject: z.string(),
        body: z.string(),
        cc: z.array(z.string()).optional(),
      }),
    }
  );

  export const createCalendarEvent = tool(
    async ({ title, startTime, endTime, attendees, location }) => {
      // Stub: In practice, this would call Google Calendar API, Outlook API, etc.
      return `Event created: ${title} from ${startTime} to ${endTime} with ${attendees.length} attendees`;
    },
    {
      name: "create_calendar_event",
      description: "Create a calendar event. Requires exact ISO datetime format.",
      schema: z.object({
        title: z.string(),
        startTime: z.string().describe("ISO format: '2024-01-15T14:00:00'"),
        endTime: z.string().describe("ISO format: '2024-01-15T15:00:00'"),
        attendees: z.array(z.string()).describe("email addresses"),
        location: z.string().optional(),
      }),
    }
  );

  export const getContact = tool(
    async ({ query }) => {
      return  JSON.stringify(CONTACT_LIST);
    },
    {
      name: "get_contact",
      description: "Get contact information from contact list.",
      schema: z.object({
        query: z.string().describe("The query to use for extract the contact information. for example: get the contact information of the person who is in the engineering team."),
      }),
    }
  );
 
  export const getAvailableTimeSlots = tool(
    async ({ attendees, date, durationMinutes }) => {
      // Stub: In practice, this would query calendar APIs
      return ["09:00", "14:00", "16:00"];
    },
    {
      name: "get_available_time_slots",
      description: "Check calendar availability for given attendees on a specific date.",
      schema: z.object({
        attendees: z.array(z.string()),
        date: z.string().describe("ISO format: '2024-01-15'"),
        durationMinutes: z.number(),
      }),
    }
  );


  export const scheduleEvent = tool(
    async ({ request }) => {
      const result = await calendarAgent.invoke({
        messages: [{ role: "user", content: request }]
      });
      const lastMessage = result.messages[result.messages.length - 1];
      return lastMessage.text;
    },
    {
      name: "schedule_event",
      description: `
  Schedule calendar events using natural language.
  
  Use this when the user wants to create, modify, or check calendar appointments.
  Handles date/time parsing, availability checking, and event creation.
  
  Input: Natural language scheduling request (e.g., 'meeting with design team next Tuesday at 2pm')
      `.trim(),
      schema: z.object({
        request: z.string().describe("Natural language scheduling request"),
      }),
    }
  );
  
  export const manageEmail = tool(
    async ({ request }) => {
      const result = await emailAgent.invoke({
        messages: [{ role: "user", content: request }]
      });
      const lastMessage = result.messages[result.messages.length - 1];
      return lastMessage.text;
    },
    {
      name: "manage_email",
      description: `
  Send emails using natural language.
  
  Use this when the user wants to send notifications, reminders, or any email communication.
  Handles recipient extraction, subject generation, and email composition.
  
  Input: Natural language email request (e.g., 'send them a reminder about the meeting')
      `.trim(),
      schema: z.object({
        request: z.string().describe("Natural language email request"),
      }),
    }
  );


  export const constactSearch = tool(
    async ({ query }) => {
     
      const result = await contactAgent.invoke({
        messages: [{ role: "user", content: query }]
      });
      const lastMessage = result.messages[result.messages.length - 1];
      return lastMessage.text;
    },
    {
      name: "contact_search",
      description: `Get the contact using natural language. use this when the user wants to get the contact information of the person who is in the engineering team. example: get the contact information of the person who is in the engineering team.
      Input: Natural language contact request (e.g., 'get the contact information of the person who is in the engineering team.')
      `.trim(),
      schema: z.object({
        query: z.string().describe("The query to use for extract the contact information. for example: get the contact information of the person who is in the engineering team. Or get the contact email information of the person who is in the sales team."),
      }),
    }
  );