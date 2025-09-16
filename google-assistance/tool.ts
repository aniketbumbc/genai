import { tool } from '@langchain/core/tools';
import { google } from 'googleapis';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const tokensString: any = process.env.TOKENS_JSON;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

oauth2Client.setCredentials(JSON.parse(tokensString));

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export const createCalenderEvent = tool(
  async () => {
    // google calender logic here
    return ' Meeting has been created';
  },
  {
    name: 'create-event',
    description: 'Call to create the calendar events',
  }
);

export const getCalendarEvents = tool(
  async (params) => {
    // google calender logic here

    console.log('Params', params);

    const { q, timeMin, timeMax } = params;

    try {
      const response = await calendar.events.list({
        calendarId: 'primary',
        q: q,
        timeMax,
        timeMin,
      });

      const result = response?.data?.items?.map((event) => {
        return {
          id: event?.id,
          summary: event?.summary,
          status: event?.status,
          location: event?.location,
          meetingLink: event?.htmlLink,
        };
      });

      return JSON.stringify(result);
    } catch (error) {
      console.log('Error', error);
    }

    return 'Failed connect to google calendar please try again';
  },
  {
    name: 'get-events',
    description: 'Call to get the calendar events',
    schema: z.object({
      q: z
        .string()
        .describe(
          'The query to be used to get events from google calendar based on summary or description or location and display name'
        ),
      timeMin: z
        .string()
        .describe('The from datetime in UTC format for the event'),
      timeMax: z
        .string()
        .describe('The to datetime in UTC format for the event'),
    }),
  }
);
