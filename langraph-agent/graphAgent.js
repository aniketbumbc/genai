import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { TavilySearch } from '@langchain/tavily';
import { tool } from '@langchain/core/tools';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { MessagesAnnotation, StateGraph, END } from '@langchain/langgraph';
import { z } from 'zod';
import { writeFileSync } from 'node:fs';
dotenv.config();
/**
 *
 * Tools
 *
 */

const tavilySearch = new TavilySearch({
  maxResults: 3,
  topic: 'general',
  tavilyApiKey: process.env.TAVILY_API_KEY,
});

const calendarEvents = tool(
  async ({ query }) => {
    console.log(query);
    // google calender logic here
    return JSON.stringify([
      {
        title: 'meeting with mike',
        location: 'google meet',
        time: '2 PM',
        date: '15 September 2025',
      },
    ]);
  },
  {
    name: 'get-calendar-events',
    description: 'Call to get the calendar events',
    schema: z.object({
      query: z.string().describe('The query to use in calendar event search.'),
    }),
  }
);

const callModelNode = async (state) => {
  console.log('Calling model');

  const response = await llm.invoke(state.messages);

  return { messages: [response] }; // this return added to global state to store
};
const tools = [tavilySearch, calendarEvents];
const toolNode = new ToolNode(tools);

/**
 *  Stetup llm
 */
const llm = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
}).bindTools(tools);

/**
 *  Conditional edge function
 */

const checkCurrentStatus = (state) => {
  /**
   * Check previous condition into state ai messages if tool call then return tool
   * else return END
   */

  const lastMessage = state?.messages[state.messages.length - 1];

  if (!!lastMessage.tool_calls?.length) {
    return 'funcNode';
  }

  return '__end__';
};

/**
 *  build graph
 * // Name of node and function to call
 */

const graph = new StateGraph(MessagesAnnotation)
  .addNode('llm', callModelNode)
  .addNode('funcNode', toolNode)
  .addEdge('__start__', 'llm')
  .addEdge('funcNode', 'llm')
  .addConditionalEdges('llm', checkCurrentStatus);

const app = graph.compile();

const main = async () => {
  const result = await app.invoke({
    messages: [{ role: 'user', content: 'what is weather in baltimore' }],
  });

  const drawableGraphGraphState = await app.getGraphAsync();
  const graphStateImage = await drawableGraphGraphState.drawMermaidPng();
  const graphStateArrayBuffer = await graphStateImage.arrayBuffer();

  const filePath = './customGraph.png';
  writeFileSync(filePath, new Uint8Array(graphStateArrayBuffer));

  const lastMessageContent =
    result.messages?.[result.messages.length - 1].content;

  console.log('Assistant: ', lastMessageContent);
};

main();
