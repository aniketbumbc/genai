import { END, StateGraph } from '@langchain/langgraph';
import { model } from './model.js';
import { StateAnnotation } from './state.js';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { getOffers, getKnowledgeBaseTool } from './tools.js';
const learningTools = [getKnowledgeBaseTool];
const marketingTools = [getOffers];
const marketingToolNode = new ToolNode(marketingTools);
const learningToolNode = new ToolNode(learningTools);

export const frontDeskSupport = async (state) => {
  const SYSTEM_PROMPT = `You are frontline support staff for my website, 
  a company that helps software developers excel in their careers through practical 
  web development and generative AI courses. 
  Be concise in your response. 
  You can chat with students and help them with basic queries, 
  but if the student is having a marketing or learning support query, do not try to answer the question directly or gather information. 
  Instead, immediately transfer them to marketing team, for example, promos, code, discount, offer, and special campaigns, 
  or learning support team, for example, course, example coverage, learning path, and 
  study strategy by asking the user to hold for a moment I am working on it. 
  Otherwise, just respond conversationally.`;

  const supportResponse = await model.invoke([
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    ...state.messages,
  ]);

  const CATEGORY_SYSTEM_PROMPT = `You are an expert customer support routing system. 
  Your job is to route customers either marketing team or learning support team, or just identify it is normal conversation. 
  Your job is to detect whether customer representative needs to route marketing team or learning support team.`;

  const CATEGORY_HUMAN_PROMPT = `The provided audio describes a task to analyze a conversation between a customer support representative and a user. 
  The goal is to determine if the representative is routing the user to the marketing team, the learning support team, or simply responding conversationally. 
  
  The output should be a JSON object with a single key, "nextRepresentative,"
   and a value corresponding to one of the following: "MARKETING," "LEARNING," or "RESPOND." 
   
   ****** Important output *****
If they want to route the user to the marketing team. Respond with "MARKETING.
If they want to route the user to the learning support team. Respond with "LEARNING". 
Otherwise, respond only if the word is "RESPOND".

*** output format ***

{ "nextRepresentative": "MARKETING" }
{ "nextRepresentative": "LEARNING" }
{ "nextRepresentative": "RESPOND" }`;

  const categorizationResponse = await model.invoke(
    [
      {
        role: 'system',
        content: CATEGORY_SYSTEM_PROMPT,
      },
      ...state.messages,
      {
        role: 'user',
        content: CATEGORY_HUMAN_PROMPT,
      },
    ],
    {
      response_format: {
        type: 'json_object',
      },
    }
  );

  const categorizationResponseOutput = JSON.parse(
    categorizationResponse.content
  );

  return {
    messages: [supportResponse],
    nextRepresentative:
      categorizationResponseOutput?.nextRepresentative || 'RESPOND',
  };
};

export const marketingSupport = async (state) => {
  const llmWithTools = model.bindTools(marketingTools);

  const SYSTEM_PROMPT = `You are part of the marketing team at ed tech  company platform.
    The company builds that helps software developers excel their careers to practical web development and generative AI courses.
   You specialise in handling questions about promo codes, discount offers, and special campaigns.
   Answer clearly, concisely, and in a friendly manner.
   For queries outside promotions, like course content, learning, politely redirect the student to the correct team.
   Important: Answer only using given context. Else, I don't have enough information about it.`;

  let constructMessage = state.messages;

  if (constructMessage.at(-1)?.getType() === 'ai') {
    constructMessage = constructMessage.slice(0, -1);
  }

  const marketResponse = await llmWithTools.invoke([
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    ...constructMessage,
  ]);

  return {
    messages: [marketResponse],
  };
};

export const learningSupport = async (state) => {
  console.log('Handling by learning support team.....');
  const llmWithTools = model.bindTools(learningTools);

  const SYSTEM_PROMPT = `You are part of the learning support team at CodeScan, a tech company. 
  The company helps software developers excel in their careers through practical web development and generative AI courses. 
  You assist students with questions about available courses, syllabus coverage, learning paths, and study strategies to keep your answers concise and supportive. 
  Strictly use information for retrieved context for answering queries. If the query is about learning issues, politely redirect the student to the respective team. 
  Important: Call getKnowledgeBaseTool max 3 times if the tool result is not relevant to the original query.`;

  let constructMessage = state.messages;

  if (constructMessage.at(-1)?.getType() === 'ai') {
    constructMessage = constructMessage.slice(0, -1);
  }

  const learningResponse = await llmWithTools.invoke([
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    ...constructMessage,
  ]);

  return {
    messages: [learningResponse],
  };
};

const handleNextFlow = (state) => {
  if (state.nextRepresentative?.includes('MARKETING')) {
    return 'marketingSupport';
  } else if (state.nextRepresentative?.includes('LEARNING')) {
    return 'learningSupport';
  } else {
    return '__end__';
  }
};

const isMarketingTool = (state) => {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return 'marketingTools';
  }

  return '__end__';
};

const isLearningTool = (state) => {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return 'learningTools';
  }

  return '__end__';
};

const graph = new StateGraph(StateAnnotation)
  .addNode('frontDeskSupport', frontDeskSupport)
  .addNode('marketingSupport', marketingSupport)
  .addNode('learningSupport', learningSupport)
  .addNode('marketingTools', marketingToolNode)
  .addNode('learningTools', learningToolNode)
  .addEdge('__start__', 'frontDeskSupport')
  .addEdge('marketingTools', 'marketingSupport')
  .addEdge('learningTools', 'learningSupport')
  .addConditionalEdges('frontDeskSupport', handleNextFlow, {
    marketingSupport: 'marketingSupport',
    learningSupport: 'learningSupport',
    __end__: '__end__',
  })
  .addConditionalEdges('marketingSupport', isMarketingTool, {
    marketingTools: 'marketingTools',
    __end__: END,
  })
  .addConditionalEdges('learningSupport', isLearningTool, {
    learningTools: 'learningTools',
    __end__: END,
  });

const app = graph.compile();

export const main = async () => {
  const stream = await app.stream({
    messages: [
      {
        role: 'user',
        content: 'what will be cover in full stack course?',
      },
    ],
  });

  for await (const value of stream) {
    console.log('***** STEP START *******');
    console.log(value);
    console.log('***** STEP END *******');
  }
};
