import { START, StateGraph } from '@langchain/langgraph';
import { modelWriter } from './model';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { LinkedinState } from './state';

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
  const SYSTEM_PROMPT = `You are a tough LinkedIn editor for beginner devs. 
  priority: remove buzzword clichés, keep it clear, concise, specific, and relatable. 
  Check against: 
  1. Strong hook in one to two lines, 
  2. Beginner-friendly clarity, explain the jargons with analogy or example, 
  3. Specific insights and the concrete example not generic advice. 
  4. skiable formatting, short line white spaces.
  5. Clear CTA to follow for more.
  6. 150 to 200 words, less than three emojis, authenticate tone, no controversy.
  
 Output format: no score, no questions, no meta. 
 
 Start with Revise now. Apply all changes below. Output only revised post text. 

 Here is a clean template you can use to give instructions for fixing an AI-generated paragraph, followed by bullet-point edit instructions:

---

**Instructions to Fix Paragraph from AI**

Improve the paragraph for clarity, conciseness, technical accuracy, and professional tone. Remove filler, correct grammar, and ensure the explanation is precise and useful.

**Direct Edit Instructions (Bullet Points)**

* Remove redundant phrases and simplify sentence structure.
* Replace vague terms with specific technical terminology.
* Fix grammar, spelling, and punctuation errors.
* Make explanations direct and action-focused.
* Remove unnecessary adjectives and filler words.
* Ensure all statements are technically correct and consistent.
* Improve logical flow between sentences.
* Use active voice where possible.
* Keep the final paragraph concise and professional.
`;

  const criticResponse = await modelWriter.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    ...state.messages,
  ]);

  return { messages: new HumanMessage(criticResponse?.content) };
};
const shouldContinue = (state) => {};

export const graph = new StateGraph(LinkedinState)
  .addNode('writer', writer)
  .addNode('critique', critique)
  .addEdge(START, 'writer')
  .addEdge('critique', 'writer')
  .addConditionalEdges('writer', shouldContinue);
