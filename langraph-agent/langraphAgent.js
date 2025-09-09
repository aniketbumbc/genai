import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

dotenv.config();

const main = async () => {
  const agentModel = new ChatOpenAI({
    model: 'gpt-4o',
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY,
  });

  const agent = createReactAgent({
    llm: agentModel,
    tools: [],
  });

  const result = await agent.invoke({
    messages: [
      {
        role: 'user',
        content: 'Hello I am Aniket',
      },
    ],
  });

  console.log('Result: ', result);
};

main();
