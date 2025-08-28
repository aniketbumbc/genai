import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { tavily } from '@tavily/core';
import readline from 'node:readline/promises';

dotenv.config(); // Load .env variables

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const main = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

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
- Simply output the raw response returned by the tool — nothing more, nothing less.

Your role in this case is to act only as a **relay**, passing the tool's response directly to the user.


Behavior Guidelines:

- Always be polite, professional, and helpful.
- If you need external or internal data to answer a question, call the appropriate tool.
- If you can't answer a question directly or lack enough context, politely ask the user for more details.
- When using any tools, explain to the user what you're doing (e.g., “Searching the university system for that information...”).
`,
    },
  ];

  while (true) {
    const question = await rl.question('You: ');

    if (question === 'bye') {
      break;
    }

    messages.push({
      role: 'user',
      content: question,
    });

    while (true) {
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
        console.log(`AI: ${response.choices[0].message.content}`);
        break;
      }

      for (const tool of toolCalls) {
        const toolName = tool.function.name;
        const params = tool.function.arguments;

        console.log('toolName', toolName);
        console.log('params', params);

        if (toolName === 'webSearch') {
          toolResponse = await webSearch(JSON.parse(params));
          messages.push({
            tool_call_id: tool.id,
            role: 'tool',
            name: toolName,
            content: toolResponse,
          });
        } else if (toolName === 'universityInfoSearch') {
          console.log('Calling universitySearch', toolName);
          toolResponse = await universitySearch(JSON.parse(params));
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
  }
  rl.close();
};

main();

const webSearch = async ({ query }) => {
  console.log('Calling..... Web Search');
  const response = await tvly.search(query);

  const finalContent = response.results
    .map((result) => result.content)
    .join('\n\n');

  return finalContent;
};

const universitySearch = async ({ info }) => {
  console.log('This is you query: ', info);

  console.log('Calling..... university Search');

  return 'Welcome to university we will give you update soon';
};
