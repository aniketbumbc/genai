import { ChatOpenAI } from '@langchain/openai';
import { MessagesAnnotation } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { MemorySaver } from '@langchain/langgraph';
import { initDb } from './db.js';
import { initTools } from './tools';
import { StateGraph } from '@langchain/langgraph';
import { AIMessage } from '@langchain/core/messages';
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

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const llmWithTools = llm.bindTools(tools);

  const response = await llmWithTools.invoke([
    {
      role: 'user',
      content: `You are a helpful assistant that can add expenses to the expense tracker. currenttime is ${new Date().toISOString()} 
      Call add_expense tool to add an expense to the database. call if needed get_expenses tool to get total amount of expenses from the database between two dates Show the total amount of expenses in the response. `,
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
  // need to change this when graph ui functionality is implemented
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
  });

const agent = graph.compile({
  checkpointer: new MemorySaver(),
});

const main = async () => {
  const result = await agent.invoke(
    {
      messages: [
        {
          role: 'user',
          content: 'how much total amount did I spend in this week?',
        },
      ],
    },

    {
      configurable: {
        thread_id: 'user-1',
      },
    },
  );
  console.log(JSON.stringify(result, null, 2));
};

main();
