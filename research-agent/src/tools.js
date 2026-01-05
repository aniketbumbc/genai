import { HumanMessage } from '@langchain/core/messages';
import { TavilySearch } from '@langchain/tavily';
import dotenv from 'dotenv';


dotenv.config();

const tavilySearch = new TavilySearch({
  maxResults: 2,
  tavilyApiKey: process.env.TAVILY_API_KEY,
});


export const searchExecutor = async (state) => {

    const lastMessage = state.messages[state.messages.length - 1];
    
    // Handle both cases: content might be an object or a JSON string
    let parseMessage;
    if (typeof lastMessage.content === 'string') {
        parseMessage = JSON.parse(lastMessage.content);
    } else {
        parseMessage = lastMessage.content;
    }

    console.log("parseMessage:", parseMessage);
    
    const searchResults = await tavilySearch.batch(parseMessage?.searchQueries?.map(query => ({query})));

    const cleanResult = [];

    for(let i = 0; i< parseMessage.searchQueries.length; i++){
        const query = parseMessage.searchQueries[i];
        const searchQueryResults = searchResults[i];

        const actualResult = searchQueryResults?.result || [];


        for(const result of actualResult){
            cleanResult.push({
                query: query,
                result: result.content || '',
                result_url: result.url || '',
            })
        }
      
    }

    return {
        messages: [new HumanMessage(JSON.stringify({searchHumanResults: cleanResult}))],
    }
};

