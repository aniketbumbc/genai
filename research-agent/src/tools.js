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
        try {
            parseMessage = JSON.parse(lastMessage.content);
        } catch (e) {
            // If parsing fails, try to use content as-is
            parseMessage = lastMessage.content;
        }
    } else {
        parseMessage = lastMessage.content;
    }

    console.log("parseMessage:", parseMessage);
    
    // Validate parseMessage and extract searchQueries
    let searchQueries = [];
    if (parseMessage && typeof parseMessage === 'object' && !Array.isArray(parseMessage)) {
        searchQueries = parseMessage.searchQueries || [];
    } else if (Array.isArray(parseMessage)) {
        // If parseMessage is an array, it might be the searchQueries directly
        searchQueries = parseMessage;
    }

    // Ensure searchQueries is an array and not empty
    if (!Array.isArray(searchQueries) || searchQueries.length === 0) {
        console.warn("No search queries found, returning empty results");
        return {
            messages: [new HumanMessage(JSON.stringify({searchHumanResults: []}))],
        };
    }

    // Map queries to the format expected by tavilySearch.batch
    const searchInputs = searchQueries.map(query => ({ query }));
    
    // Ensure we have valid inputs before calling batch
    if (!searchInputs || searchInputs.length === 0) {
        console.warn("No valid search inputs, returning empty results");
        return {
            messages: [new HumanMessage(JSON.stringify({searchHumanResults: []}))],
        };
    }
    
    const searchResults = await tavilySearch.batch(searchInputs);

    const cleanResult = [];

    for(let i = 0; i < searchQueries.length; i++){
        const query = searchQueries[i];
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

