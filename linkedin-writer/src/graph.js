import { START, StateGraph } from '@langchain/langgraph';
import { LinkedinState } from './state';

const writer = async (state) => {
  //call llm for writer function

  const SYSTEM_PROMPT = '';

  return state;
};
const critique = async (state) => {
  return state;
};
const shouldContinue = (state) => {};

export const graph = new StateGraph(LinkedinState)
  .addNode('writer', writer)
  .addNode('critique', critique)
  .addEdge(START, 'writer')
  .addEdge('critique', 'writer')
  .addConditionalEdges('writer', shouldContinue);
