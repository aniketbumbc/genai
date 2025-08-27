import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const main = async () => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: `You are smart personal assistant who answers the asked questions.
        You have access following tools:
        1. searchWeb({query}) // search latest information and realtime data on the internet
        `,
      },
      {
        role: 'user',
        content:
          'Tell me about online game platform allowed in india? what is current news',
      },
    ],
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
      console.log('toolResponse', toolResponse);
    }
  }
};

main();

const webSearch = async ({ query }) => {
  console.log('webSearch calling');
  return 'Online game platform banned in india 22 August';
};
