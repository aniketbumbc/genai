import { END, START, StateGraph } from '@langchain/langgraph';
import {llm} from './model.js';
import { AIMessage } from '@langchain/core/messages';
import { graphState } from './state.js';
import { questoinAnswerSchema } from './state.js';

async function responser(state) {

  const current_dateTime = new Date().toLocaleDateString('sv-SE');
 

    const SYSTEM_PROMPT= `You are expert researcher agent. You are given a query and you need to research the query and provide the answer.
    The current date and time is ${current_dateTime}.
    1. You need to provide approx ~250 words answer.
    2. Refect and critique the answer.Be serve maximum improvment in the answer.
    3. Stricly use maximum 2 search queries to research information and improve the answer each time.`

      const llmStructuredOutput = llm.withStructuredOutput(questoinAnswerSchema);

      const response = await llmStructuredOutput.invoke([
       {
        role: 'system',
        content: SYSTEM_PROMPT,
       },
       ...state.messages,
       {
        role: 'system',
        content: `Reflect on original user question and action taken thus far. Respond using structured output format.`
      },
    ]);

    return{
      messages: [new AIMessage(response)],
    }
  }


  const workFlow = new StateGraph(graphState).addNode('responser', responser).addEdge(START, 'responser').addEdge('responser', END);