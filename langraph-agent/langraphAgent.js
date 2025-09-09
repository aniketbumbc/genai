import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { TavilySearch } from '@langchain/tavily';

dotenv.config();

const main = async () => {
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

  const agent = createReactAgent({
    llm: agentModel,
    tools: [tavilySearch],
  });

  const result = await agent.invoke({
    messages: [
      {
        role: 'user',
        content: 'What is current weather in Mumbai',
      },
    ],
  });

  console.log(
    'Assistant:',
    result.messages[result.messages.length - 1].content
  );
};

main();
