import { ChatOpenAI } from '@langchain/openai';
import { MessagesAnnotation } from '@langchain/langgraph';

import type { LangGraphRunnableConfig } from '@langchain/langgraph';

import { ToolNode } from '@langchain/langgraph/prebuilt';
import { MemorySaver } from '@langchain/langgraph';
import { initDb } from './db.js';
import { initTools } from './tools';
import { StateGraph } from '@langchain/langgraph';
import { AIMessage, ToolMessage } from '@langchain/core/messages';
import * as dotenv from 'dotenv';

dotenv.config();

const db = initDb('./expenses.db');
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error('OPENAI_API_KEY is not set');
}

const tools = initTools(db);

const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0,
  apiKey: openaiApiKey,
});

const toolNode = new ToolNode(tools);

const callModel = async (
  state: typeof MessagesAnnotation.State,
  config: LangGraphRunnableConfig,
) => {
  const llmWithTools = llm.bindTools(tools);

  config.writer?.('.....Calling LLM with tools to generate expense chart');

  const response = await llmWithTools.invoke([
    {
      role: 'user',
      content: `You are a helpful assistant that can add expenses to the expense tracker. currenttime is ${new Date().toISOString()} 
      Call add_expense tool to add an expense to the database. call if needed get_expenses tool to get total amount of expenses from the database between two dates Show the total amount of expenses in the response. 
      Call generate_expense_chart tool only when user needs to visualize the expenses data.
      `,
    },
    ...state.messages,
  ]);

  return {
    messages: [response],
  };
};

const shouldContinue = async (state: typeof MessagesAnnotation.State) => {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage.tool_calls?.length) {
    return 'tools';
  }
  return '__end__';
};

const shouldCallModel = async (state: typeof MessagesAnnotation.State) => {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as ToolMessage;

  const messageContent = JSON.parse(lastMessage.content as string);

  if (messageContent.type === 'chart') {
    return '__end__';
  }
  return 'callModel';
};

/**
 *  Graph Build
 */

const graph = new StateGraph(MessagesAnnotation)
  .addNode('callModel', callModel)
  .addNode('tools', toolNode)
  .addEdge('__start__', 'callModel')
  .addConditionalEdges('callModel', shouldContinue, {
    tools: 'tools',
    __end__: '__end__',
  })
  .addConditionalEdges('tools', shouldCallModel, {
    callModel: 'callModel',
    __end__: '__end__',
  });

const agent = graph.compile({
  checkpointer: new MemorySaver(),
});

const main = async () => {
  const result = await agent.stream(
    {
      messages: [
        {
          role: 'user',
          content:
            'I want visualize the expenses all data on date wise, can you show me a chart data for all expenses on date wise?',
        },
      ],
    },

    {
      configurable: {
        thread_id: 'user-1',
      },
      streamMode: ['updates', 'custom'],
    },
  );

  for await (const chunk of result) {
    console.log('chunk', chunk);
    // const [step, content] = Object.entries(chunk)[0];
    // console.log(`${step}: ${content}`);
    // console.log(JSON.stringify(chunk, null, 2));
  }
};

main();
