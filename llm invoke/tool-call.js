import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { tavily } from '@tavily/core';

dotenv.config(); // Load .env variables

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const main = async () => {
  const messages = [
    {
      role: 'system',
      content: `You are smart personal assistant who answers the asked questions.
        You have access following tools:
        1. searchWeb({query}) // search latest information and realtime data on the internet
        `,
    },
    {
      role: 'user',
      content: 'is there any festival going on in mumbai now',
    },
  ];

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0,
    messages: messages,
    tools: [
      {
        type: 'function',
        function: {
          name: 'webSearch',
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
    ],
    tool_choice: 'auto',
  });

  messages.push(response.choices[0].message);

  const toolCalls = response.choices[0].message.tool_calls;
  let toolResponse;

  if (!toolCalls) {
    console.log(`AI: ${response.choices[0].message.content}`);
    return;
  }

  for (const tool of toolCalls) {
    const toolName = tool.function.name;
    const params = tool.function.arguments;

    if (toolName === 'webSearch') {
      toolResponse = await webSearch(JSON.parse(params));
      messages.push({
        tool_call_id: tool.id,
        role: 'tool',
        name: toolName,
        content: toolResponse,
      });
    }
  }

  console.log('messages', messages);

  const response2 = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0,
    messages: messages,
  });

  console.log(response2.choices[0].message.content);
};

main();

const webSearch = async ({ query }) => {
  const response = await tvly.search(query);

  const finalContent = response.results
    .map((result) => result.content)
    .join('\n\n');

  return finalContent;
};
