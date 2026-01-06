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
      messages: [new AIMessage(JSON.stringify(response))],
      iterationCount: 0
    }
  }



  // Helper function to extract search results with URLs
  const extractSearchResults = (messages) => {
    const searchResults = [];
    for (const message of messages) {
      let content;
      if (typeof message.content === 'string') {
        try {
          content = JSON.parse(message.content);
        } catch (e) {
          continue;
        }
      } else {
        content = message.content;
      }
      
      if (content && typeof content === 'object' && content.searchHumanResults) {
        const results = Array.isArray(content.searchHumanResults) ? content.searchHumanResults : [];
        for (const result of results) {
          if (result.result_url) {
            searchResults.push({
              url: result.result_url,
              content: result.result || '',
              query: result.query || ''
            });
          }
        }
      }
    }
    return searchResults;
  }

  const revisioner = async (state) => {

    const current_dateTime = new Date().toLocaleDateString('sv-SE');
    
    // Extract search results with URLs
    const searchResults = extractSearchResults(state.messages);
    
    // Format search results for the prompt
    let searchResultsText = '';
    if (searchResults.length > 0) {
      searchResultsText = '\n\nAVAILABLE SEARCH RESULTS WITH URLs:\n';
      searchResults.forEach((result, index) => {
        searchResultsText += `[${index + 1}] URL: ${result.url}\n`;
        searchResultsText += `    Query: ${result.query}\n`;
        searchResultsText += `    Content: ${result.content.substring(0, 200)}...\n\n`;
      });
      searchResultsText += 'YOU MUST USE THESE EXACT URLs IN YOUR REFERENCES SECTION.\n';
    }
    
    const SYSTEM_PROMPT = `
    You are expert researcher agent. Current date and time is ${current_dateTime}.
    Your task is to revise the answer based on the search results and the original question.
    ${searchResultsText}
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
     4. MANDATORY: Use the EXACT URLs provided in the "AVAILABLE SEARCH RESULTS WITH URLs" section above. 
        Each URL should be numbered [1], [2], [3], etc. in the order they appear.
        DO NOT make up URLs. ONLY use the URLs from the search results provided above.
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
     iterationCount: state.iterationCount + 1,
   }

  }


  // Helper function to extract search queries from message
  const extractSearchQueries = (message) => {
    let parseMessage;
    if (typeof message.content === 'string') {
        try {
            parseMessage = JSON.parse(message.content);
        } catch (e) {
            parseMessage = message.content;
        }
    } else {
        parseMessage = message.content;
    }
    
    let searchQueries = [];
    if (parseMessage && typeof parseMessage === 'object' && !Array.isArray(parseMessage)) {
        searchQueries = parseMessage.searchQueries || [];
    } else if (Array.isArray(parseMessage)) {
        searchQueries = parseMessage;
    }
    
    return Array.isArray(searchQueries) ? searchQueries : [];
  }

  // Route from responser to searchExecutor or END
  const routeFromResponser = (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const searchQueries = extractSearchQueries(lastMessage);
    
    // If no search queries, end the workflow
    if (searchQueries.length === 0) {
      return END;
    }
    
    return 'searchExecutor';
  }

  // Route from revisioner to searchExecutor or END
  const shouldContinue = (state) => {
    const MAX_ITERATIONS = 2;
    if (state.iterationCount >= MAX_ITERATIONS) {
      return END;
    }
    
    // Check if we have search queries to continue
    const lastMessage = state.messages[state.messages.length - 1];
    const searchQueries = extractSearchQueries(lastMessage);
    
    // If no search queries, end the workflow
    if (searchQueries.length === 0) {
      return END;
    }
    
    return 'searchExecutor';
  }


  export const workFlow = new StateGraph(graphState).addNode('responser', responser).
  addNode('searchExecutor', searchExecutor).
  addNode('revisioner', revisioner)
  .addEdge(START, 'responser')
  .addConditionalEdges('responser', routeFromResponser, {
    searchExecutor: 'searchExecutor',
    [END]: END,
  })
  .addEdge('searchExecutor', 'revisioner')
 .addConditionalEdges('revisioner', shouldContinue, {  
    [END]: END,
    searchExecutor: 'searchExecutor',
  });

  const app = workFlow.compile();

  export default app;