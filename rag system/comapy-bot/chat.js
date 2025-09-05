import readline from 'node:readline/promises';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { vectorStore } from './docIndex.js';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const chat = async (question) => {
  // const rl = readline.createInterface({
  //   input: process.stdin,
  //   output: process.stdout,
  // });

  const MAX_RETRIES = 5;
  let count = 0;

  while (true) {
    if (count > MAX_RETRIES) {
      return 'I not able find result Please try some time';
    }

    count++;

    // retrieval

    const similaritySearchResults = await vectorStore.similaritySearch(
      question,
      3
    );

    const context = similaritySearchResults
      .map((chunk) => chunk.pageContent)
      .join('\n\n');

    const SYSTEM_PROMPT = `You are an intelligent assistant for a company chatbot. Your job is to answer user questions strictly based on the provided context, which comes from internal company PDFs.

Instructions:

Use only the information provided in the context below to answer the question.
Do not guess or add information not found in the context.
If the answer is not in the context, say: "The provided documents do not contain information to answer that question."
Be concise, clear, and professional.
Use complete sentences.
Do not mention that you are an AI or that the information is from documents.`;

    const userQuery = `Question: ${question}
Relevant context: ${context}
Answer:
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userQuery,
        },
      ],
    });

    return response.choices[0].message.content;
  }
};
