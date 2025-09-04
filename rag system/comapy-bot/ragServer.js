import { indexDocument, vectorStore } from './docIndex.js';
const docPath = './cg-internal-docs.pdf';

//indexDocument(docPath);

const similaritySearchResults = await vectorStore.similaritySearch('leave');

for (const doc of similaritySearchResults) {
  console.log(`* ${doc.pageContent} [${JSON.stringify(doc.metadata, null)}]`);
}
