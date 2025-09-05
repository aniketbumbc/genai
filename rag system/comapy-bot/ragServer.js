import { indexDocument, vectorStore } from './docIndex.js';
const docPath = './cg-internal-docs.pdf';

indexDocument(docPath);

//const similaritySearchResults = await vectorStore.similaritySearch('leave');

//https://js.langchain.com/docs/integrations/vectorstores/pinecone/
