import { ChatOpenAI } from '@langchain/openai';
import { MessagesAnnotation } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { initDb } from './db.js';
import { initTools } from './tools.js';

const db = initDb('./expenses.db');

const tools = initTools(db);

const llm = new ChatOpenAI({
  model: 'gpt-5.4',
  temperature: 0,
  // other params...
});

const toolNode = ToolNode.fromTools(tools);

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const llmWithTools = llm.bindTools(tools);

  const response = await llmWithTools.invoke([
    {
      role: 'user',
      content: `You are a helpful assistant that can add expenses to the expense tracker. currenttime is ${new Date().toISOString()} 
      Call add_expense tool to add an expense to the database.`,
    },
    ...state.messages,
  ]);

  return {
    messages: [response],
  };
};
