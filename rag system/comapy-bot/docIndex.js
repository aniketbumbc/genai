import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export const indexDocument = async (path) => {
  const loader = new PDFLoader(path, { splitPages: false });
  const doc = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const texts = await textSplitter.splitText(doc[0].pageContent);
  console.log(texts);
  texts.forEach((chunk, i) => {
    console.log(`Chunk ${i + 1}: ${chunk.length} characters`);
    console.log(chunk);
    console.log('='.repeat(80)); // visual separator
  });
};
