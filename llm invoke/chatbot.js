import dotenv from 'dotenv';
import { tavily } from '@tavily/core';
import OpenAI from 'openai';

dotenv.config(); // Load .env variables

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateMessage = async (userMessage) => {
  const messages = [
    {
      role: 'system',
      content: `You are a smart personal assistant designed to help users by answering their questions clearly, accurately, and efficiently.

Your primary role is to provide helpful, concise, and contextually relevant responses based on the user's query.

You have access to the following tools to enhance your capabilities:

1. searchWeb({ query })
   - Use this function to search the internet for the most recent or real-time information.
   - Ideal for news, current events, or anything requiring up-to-date public data.

2. universitySearch({ info })
   - Use this function to look up information specific to the university and its curriculum.
   - This accesses the internal university database or intranet.

⚠️ Important Constraints:

- **DO NOT** use 'searchWeb' to retrieve the current date or time and university info.
- The current date and time is already known and available:
- Current date and time: ${new Date().toString()}
When calling the 'universityInfoSearch' tool:
- You must return the **tool's response exactly as received**, without adding, rephrasing, summarizing, or interpreting it in any way.
- DO NOT modify, wrap, or reword the response.
- DO NOT add any introductions, explanations, or follow-up text.
- DO NOT call searchWeb tool give direct response from universityInfoSearch tool as it is.
- Simply output in text the raw response returned by the tool — nothing more, nothing less do not use any styling.

Your role in this case is to act only as a **relay**, passing the tool's response directly to the user.


Behavior Guidelines:

- Always be polite, professional, and helpful.
- If you need external or internal data to answer a question, call the appropriate tool.
- If you can't answer a question directly or lack enough context, politely ask the user for more details.
- Do not call multiple tools
- When using any tools, explain to the user what you're doing (e.g., “Searching the university system for that information...”).
`,
    },
  ];

  messages.push({
    role: 'user',
    content: userMessage,
  });

  while (true) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: messages,
      tools: [
        {
          type: 'function',
          function: {
            name: 'searchWeb',
            description:
              'search latest information and realtime data on the internet',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The search query to perform on the internet',
                },
              },
              required: ['query'],
            },
          },
        },

        {
          type: 'function',
          function: {
            name: 'universityInfoSearch',
            description:
              'search information about course, student, campus all things which is related to university',
            parameters: {
              type: 'object',
              properties: {
                info: {
                  type: 'string',
                  description: 'The search info to perform on the university',
                },
              },
              required: ['info'],
            },
          },
        },
      ],
      tool_choice: 'auto',
    });

    messages.push(response.choices[0].message);

    const toolCalls = response.choices[0].message.tool_calls;
    let toolResponse;

    if (!toolCalls) {
      const rawResponse = response.choices[0].message.content;
      console.log(rawResponse);

      const decoded = rawResponse.replace(/\\n/g, '\n');
      const cleaned = decoded.replace(/\*\*/g, '');
      console.log(cleaned);
      return cleaned;
    }

    for (const tool of toolCalls) {
      const toolName = tool.function.name;
      const params = tool.function.arguments;

      console.log('toolName', toolName);
      console.log('params', params);

      if (toolName === 'searchWeb') {
        toolResponse = await searchWeb(JSON.parse(params));
        messages.push({
          tool_call_id: tool.id,
          role: 'tool',
          name: toolName,
          content: toolResponse,
        });
      } else if (toolName === 'universityInfoSearch') {
        console.log('Calling universitySearch', toolName);
        toolResponse = await universityInfoSearch(JSON.parse(params));
        console.log('Response: ', toolResponse);
        messages.push({
          tool_call_id: tool.id,
          role: 'tool',
          name: toolName,
          content: toolResponse,
        });
      }
    }
  }
};

const searchWeb = async ({ query }) => {
  console.log('Calling..... search web');
  const response = await tvly.search(query);

  const finalContent = response.results
    .map((result) => result.content)
    .join('\n\n');

  return finalContent;
};

const universityInfoSearch = async ({ info }) => {
  return `Sorry, I couldn't find relevant university info for: "${info}". Please contact support.`;
};
