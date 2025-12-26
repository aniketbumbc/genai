import { END, START, StateGraph } from '@langchain/langgraph';
import {llm} from './model.js';
import { AIMessage } from '@langchain/core/messages';
import { graphState } from './state.js';
import { questoinAnswerSchema } from './state.js';
import { searchExecutor } from './tools.js';

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



  const revisioner = async (state) => {

    const current_dateTime = new Date().toLocaleDateString('sv-SE');



    const SYSTEM_PROMPT = `
    You are expert researcher agent. Current date and time is ${current_dateTime}.
    Your task is to revise the answer based on the search results and the original question.

    CRITICAL INSTRUCTIONS:
    1. Your answer should be in the following format:

    [Main Answer content with citations like [1],[2],[3]..]

    References
     -[1] https://www.actual-url-from search-query-1.com
     -[2] https://www.actual-url-from search-query-2.com
     -[3] https://www.actual-url-from search-query-3.com

     Important Instructions:
     1. write your main answer ~250 words using information from search results and the original question.
     2. Use inline citations like [1] [2] [3] .. to cite the sources.
     3. Stricly end with "References" section and given citations [1],[2],[3].
     4. extract actual url from the search results and provide it in the references.
     5. use previsous critic and search results to improve the answer.
     6. Recommned maximum 2 search queries to improve the answer.
 

     Example: Answer feild format
    Java script evloing  rapidly with this 3 [1] web applications [2]node architecture [3]react js framework    
    References
     -[1] https://www.actual-url-from search-query-1.com
     -[2] https://www.actual-url-from search-query-2.com `

     const llmStructuredOutputRevisioner = llm.withStructuredOutput(questoinAnswerSchema);

     const responseRevisioner = await llmStructuredOutputRevisioner.invoke([
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
     messages: [new AIMessage(JSON.stringify(responseRevisioner, null, 2))],
   }

  }


  const workFlow = new StateGraph(graphState).addNode('responser', responser).
  addNode('searchExecutor', searchExecutor).
  addNode('revisioner', revisioner)