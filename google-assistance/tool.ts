import { tool } from '@langchain/core/tools';
import { google } from 'googleapis';
import { z } from 'zod';
import dotenv from 'dotenv';
import crypto from 'crypto';

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
  async (eventData) => {
    // google calender logic here

    try {
      const { summary, start, end, attendees, location } = eventData as any;

      const response = await calendar.events.insert({
        calendarId: 'primary',
        sendUpdates: 'all',
        conferenceDataVersion: 1,
        requestBody: {
          start,
          end,
          summary,
          location,
          attendees,
          conferenceData: {
            createRequest: {
              requestId: crypto.randomUUID(),
              conferenceSolutionKey: {
                type: 'hangoutsMeet',
              },
            },
          },
        },
      });

      if (response.statusText === 'OK') {
        return 'The meeting has been created. Enjoy!!!!';
      }
    } catch (error) {
      console.log('Error: ', error);
    }

    return 'Oppsss!! Please try again meeting unable to create';
  },
  {
    name: 'create-event',
    description: 'Call to create the calendar events',
    schema: z.object({
      summary: z.string().describe('The title of the event'),
      start: z.object({
        dateTime: z.string().describe('The start date time of the event.'),
        timeZone: z.string().describe('The current IANA timezone string'),
      }),
      end: z.object({
        dateTime: z.string().describe('The end date time of the event.'),
        timeZone: z.string().describe('The current IANA timezone string'),
      }),
      attendees: z.array(
        z.object({
          email: z.string().describe('The email of attendees'),
          displayName: z.string().describe('The name of attendees'),
        })
      ),
      location: z.string().describe('The place/location where meeting is held'),
    }),
  }
);

export const getCalendarEvents = tool(
  async (params) => {
    // google calender logic here

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
      timeMin: z.string().describe('The from datetime to get the events'),
      timeMax: z.string().describe('The to datetime to get the events'),
    }),
  }
);

export const updateCalendarEvents = tool(
  async (params) => {
    const { q, eventId, startDateTime, endDateTime, location, attendees } =
      params;

    try {
      const response: any = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all',
        requestBody: {
          start: {
            dateTime: startDateTime,
          },
          end: {
            dateTime: endDateTime,
          },
          summary: q,
          location: location,
          attendees,
        },
      });

      return JSON.stringify(response?.data);
    } catch (error) {
      console.log('Error: ', error);
    }
  },

  {
    name: 'update-event',
    description: 'call to update the calendar event',
    schema: z.object({
      q: z
        .string()
        .describe(
          'The query to be used to update events from google calendar based on summary or description or location or display name and start time'
        ),
      eventId: z.string().describe('The unique id for that event'),
      startDateTime: z
        .string()
        .describe('The start datetime to for the meeting'),
      endDateTime: z.string().describe('The end datetime to for the meeting'),
      location: z
        .string()
        .describe('The updated location where meeting is held'),
      attendees: z.array(
        z.object({
          email: z.string().describe('The email of attendees'),
        })
      ),
    }),
  }
);
