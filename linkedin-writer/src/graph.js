import { END, START, StateGraph } from '@langchain/langgraph';
import { modelWriter } from './model.js';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { LinkedinState } from './state.js';

const writer = async (state) => {
  const SYSTEM_PROMPT = `You are a technical writer with 3 years of professional software development experience. 
  Produce clear, concise, and accurate technical content. Focus on correctness, practical insights, and developer-level detail. 
  Use precise terminology, avoid unnecessary verbosity, and prioritize clarity over style

* Write clear, concise, and accurate technical content.
* Use precise terminology and avoid fluff.
* Maintain a neutral, instructional tone.
* Include brief code snippets or pseudo-code when helpful.
* Explain concepts with practical, real-world developer insight.
* Be step-by-step when describing processes.
* Stay objective when comparing tools or methods.
* Avoid marketing language, speculation, or unverified claims.
* Produce developer-ready documentation.
`;

  const writerResponse = await modelWriter.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    ...state.messages,
  ]);

  return { messages: [writerResponse] };
};
const critique = async (state) => {
  console.log('criticResponse');
  const SYSTEM_PROMPT = `You are a critique for LinkedIn post. You are task is to give feedback previous generated post by 
  AI agent.

  priority: remove buzzword clichés, keep it clear, concise, specific, and relatable.

  Check against: 
  1. Strong hook in one to two lines, 
  2. Beginner-friendly clarity, explain the jargons with analogy or example, 
  3. Specific insights and the concrete example not generic advice. 
  4. skiable formatting, short line white spaces.
  5. Clear CTA to follow for more.
  6. 150 to 200 words, less than three emojis, authenticate tone, no controversy.
  
 Output format: no score, no questions, no meta. 
 
 Start with:
 "Revise now. Apply all changes below. Output only revised post text. Do Not write post again. Do not repeat text.
 only return the fixes" 
`;

  const lastMessages = [...state.messages]
    .reverse()
    .find((m) => m.getType() === 'ai');

  const criticResponse = await modelWriter.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    lastMessages,
  ]);

  const currentRevision = state.revisions ?? 0;

  return {
    messages: [new HumanMessage(criticResponse.content)],
    revisions: currentRevision + 1,
  };
};

const shouldContinue = (state) => {
  if (state.revisions >= 2) {
    return END;
  }

  return 'critique';
};

export const graph = new StateGraph(LinkedinState)
  .addNode('writer', writer)
  .addNode('critique', critique)
  .addEdge(START, 'writer')
  .addEdge('critique', 'writer')
  .addConditionalEdges('writer', shouldContinue, {
    [END]: END,
    critique: 'critique',
  });
