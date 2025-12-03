import { START, StateGraph } from '@langchain/langgraph';
import { LinkedinState } from './state';

const writer = async (state) => {
  // need to work on
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
