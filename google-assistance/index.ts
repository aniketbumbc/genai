import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
// @ts-ignore
import {
  createCalenderEvent,
  getCalendarEvents,
  updateCalendarEvents,
} from './tool.ts';
import {
  MessagesAnnotation,
  StateGraph,
  END,
  MemorySaver,
} from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import readline from 'node:readline/promises';

import crypto from 'crypto';

dotenv.config();

const tools: any = [
  createCalenderEvent,
  getCalendarEvents,
  updateCalendarEvents,
];

/***
 *  Memory saver
 */
const agentCheckpointer = new MemorySaver();

const llm = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
}).bindTools(tools);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('Welcome To Google Assistance');

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const response = await llm.invoke(state.messages);
  return { messages: [response] }; // this return added to global state to store
};
const toolNode = new ToolNode(tools);

/**
 *  conditional edge function
 * @param state
 * @returns
 */

const checkCurrentStatus = (state: typeof MessagesAnnotation.State) => {
  /**
   * Check previous condition into state ai messages if tool call then return tool
   * else return END
   */

  const lastMessage: any = state?.messages[state.messages.length - 1];

  if (!!lastMessage.tool_calls?.length) {
    return 'tools';
  }

  return '__end__';
};

/**
 *  build graph
 * // Name of node and function to call
 */

const graph = new StateGraph(MessagesAnnotation)
  .addNode('assistance', callModel as any)
  .addNode('tools', toolNode as any)
  .addEdge('__start__', 'assistance')
  .addEdge('tools', 'assistance')
  .addConditionalEdges('assistance', checkCurrentStatus, {
    __end__: END,
    tools: 'tools',
  });

const app = graph.compile({ checkpointer: agentCheckpointer });
const config = { configurable: { thread_id: crypto.randomUUID() } };

const main = async () => {
  while (true) {
    const question = await rl.question('You: ');

    if (question === 'bye') {
      break;
    }

    const today = new Date().toString();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const result: any = await app.invoke(
      {
        messages: [
          {
            role: 'system',
            content: `You are a personal meeting scheduler. 
You help the user by creating, viewing, updating and managing their meetings using Google Calendar. 
You also help to based on tool for update event base on description. 
directly create scheduling or modifying events. Respond clearly and concisely. today is ${today} and current timeZone ${timeZone}`,
          },
          {
            role: 'user',
            content: question,
          },
        ],
      } as any,
      config as any
    );

    console.log(`AI: ${result.messages[result.messages.length - 1].content}`);
  }
  rl.close();
};

main();
//http://localhost:3600/googlecallback
