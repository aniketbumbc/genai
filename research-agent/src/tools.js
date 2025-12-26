import { HumanMessage } from '@langchain/core/messages';
import { TavilySearch } from '@langchain/tavily';


dotenv.config();

const tavilySearch = new TavilySearch({
  maxResults: 2,
  tavilyApiKey: process.env.TAVILY_API_KEY,
});


export const searchExecutor = async (state) => {

    const lastMessage = state.messages[state.messages.length - 1];
    const parseMessage = JSON.parse(lastMessage.content);
    const searchResults = await tavilySearch.batch(parseMessage.searchQueries.map(query => ({query})));

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

