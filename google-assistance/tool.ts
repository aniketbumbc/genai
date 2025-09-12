import { tool } from '@langchain/core/tools';
import { z } from 'zod';

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
  async () => {
    // google calender logic here
    return JSON.stringify([
      {
        title: 'meeting with mike',
        location: 'google meet',
        time: '2 PM',
        date: '15 September 2025',
      },
    ]);
  },
  {
    name: 'get-events',
    description: 'Call to get the calendar events',
  }
);
