import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { vectorStore } from './docIndex.js';
import { model } from './model.js';

export const OUT_OF_SCOPE_MESSAGE = 'NO_RELEVANT_INFO_FOUND';

export const getOffers = tool(
  () => {
    return JSON.stringify([
      {
        code: 'LAUNCH',
        discount_percentage: 30,
      },
      {
        code: 'FIRST_20',
        discount_percentage: 20,
      },
      {
        code: 'FIRST_10',
        discount_percentage: 40,
      },
      {
        code: 'FESTIVAL_OFFER',
        discount_percentage: 15,
      },
    ]);
  },
  {
    name: 'get_offers_query',
    description: 'Call this tool to get the available discounts and offers.',
  }
);

const retriever = vectorStore.asRetriever();

const RELEVANCE_SYSTEM_PROMPT = `You are a relevance checker for a knowledge base retrieval system.
Given a student's query and the context retrieved for it, decide whether the context actually contains
information relevant to answering the query.
Respond only with a JSON object: { "relevant": true } or { "relevant": false }.`;

const checkRelevance = async (query, context) => {
  const response = await model.invoke(
    [
      { role: 'system', content: RELEVANCE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Query: ${query}\n\nRetrieved context:\n${context}`,
      },
    ],
    { response_format: { type: 'json_object' } },
  );

  const result = JSON.parse(response.content);
  return Boolean(result?.relevant);
};

export const getKnowledgeBaseTool = tool(
  async ({ query }) => {
    const docs = await retriever.invoke(query);

    if (!docs.length) {
      return OUT_OF_SCOPE_MESSAGE;
    }

    const context = docs.map((doc) => doc.pageContent).join('\n\n');
    const isRelevant = await checkRelevance(query, context);

    if (!isRelevant) {
      return OUT_OF_SCOPE_MESSAGE;
    }

    return context;
  },
  {
    name: 'getKnowledgeBaseTool',
    description:
      'Search and return information about syllabus, courses, FAQs Career question',
    schema: z.object({
      query: z.string().describe('The query to search the knowledge base for'),
    }),
  }
);
