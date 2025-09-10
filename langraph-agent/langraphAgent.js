import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { TavilySearch } from '@langchain/tavily';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { writeFileSync } from 'node:fs';
import readline from 'node:readline/promises';

dotenv.config();

const main = async () => {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const agentModel = new ChatOpenAI({
    model: 'gpt-4o',
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY,
  });

  const tavilySearch = new TavilySearch({
    maxResults: 3,
    topic: 'general',
    tavilyApiKey: process.env.TAVILY_API_KEY,
  });

  const calendarEvents = tool(
    async ({ query }) => {
      console.log(query);
      // google calender logic here
      return JSON.stringify([
        {
          title: 'meeting with mike',
          location: 'google meet',
          time: '2 PM',
          date: '9 September 2025',
        },
      ]);
    },
    {
      name: 'get-calendar-events',
      description: 'Call to get the calendar events',
      schema: z.object({
        query: z
          .string()
          .describe('The query to use in calendar event search.'),
      }),
    }
  );

  const saladsPrepList = tool(
    async ({ query }) => {
      return JSON.stringify([
        {
          name: 'Greek Salad',
          ingredients: [
            'cucumber',
            'tomato',
            'feta cheese',
            'olives',
            'red onion',
          ],
          timeToEat: 'lunch',
          prepTime: 10,
        },
        {
          name: 'Fruit Salad',
          ingredients: ['apple', 'banana', 'grapes', 'orange', 'kiwi'],
          timeToEat: 'breakfast',
          prepTime: 7,
        },
        {
          name: 'Quinoa Salad',
          ingredients: ['quinoa', 'chickpeas', 'cucumber', 'parsley', 'lemon'],
          timeToEat: 'dinner',
          prepTime: 20,
        },
      ]);
    },
    {
      name: 'get-your-salad',
      description: 'Call to get salad from the saladsPrepList',
      schema: z.object({
        query: z
          .string()
          .describe('The query to use for get salads for a day time event.'),
      }),
    }
  );

  const agent = createReactAgent({
    llm: agentModel,
    tools: [tavilySearch, calendarEvents, saladsPrepList],
  });

  while (true) {
    const userQuery = await rl.question('User: ');

    if (userQuery === 'bye') {
      break;
    }

    const result = await agent.invoke({
      messages: [
        {
          role: 'system',
          content: `You are a helpful, organized, and proactive **personal assistant**.

You have access to the following tools and should use them when needed to help the user:

1. **getCalendarEvents**  
   - Use this to retrieve the user's calendar schedule or upcoming events.
   - Useful for checking availability, reminding about meetings, or helping with scheduling.

2. **makeSalad**  
   - Use this to recommend or prepare a salad based on time of day, preferences, or ingredients.
   - You can ask the user follow-up questions if they don’t specify what kind of salad they want.

3. **tavilySearch**  
   - Use this to search the internet for real-time information.
   - Best for answering questions about news, recent updates, or any knowledge outside your current memory.

Your job is to act like a real human assistant:
- Be friendly and conversational.
- Ask follow-up questions if the user’s request is vague.
- Only use tools when needed — otherwise, reply directly if you already know the answer.

Examples of how to decide:
- If the user says: “What’s on my schedule today?” → use **getCalendarEvents**
- If the user says: “I want something fresh to eat” → use **makeSalad**
- If the user says: “What’s the latest on the iPhone launch?” → use **tavilySearch**

current date and time :${new Date().toUTCString()}

Always think before acting, and clearly explain what you're doing when using a tool.
`,
        },

        {
          role: 'user',
          content: userQuery,
        },
      ],
    });

    console.log(
      'Assistant: ',
      result.messages[result.messages.length - 1].content
    );
  }

  // const drawableGraphGraphState = await agent.getGraphAsync();

  // const graphStateImage = await drawableGraphGraphState.drawMermaidPng();
  // const graphStateArrayBuffer = await graphStateImage.arrayBuffer();

  // const filePath = './graphState.png';
  // writeFileSync(filePath, new Uint8Array(graphStateArrayBuffer));

  rl.close();
};

main();
