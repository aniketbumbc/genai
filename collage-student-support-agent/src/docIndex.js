import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

const embeddings = new OpenAIEmbeddings({
  model: 'text-embedding-3-small',
  apiKey: process.env.OPENAI_API_KEY,
});
const pinecone = new PineconeClient({ apiKey: process.env.PINECONE_API_KEY });

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
  maxConcurrency: 5,
});

export const indexDocument = async (path) => {
  // Load the pdf
  const loader = new PDFLoader(path, { splitPages: false });
  const doc = await loader.load();

  // chunk the data from pdf
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const texts = await textSplitter.splitText(doc[0].pageContent);

  const documents = texts.map((chunk, i) => {
    return {
      pageContent: chunk,
      metadata: doc[0].metadata,
    };
  });

  await vectorStore.addDocuments(documents);
  console.log('Vector Database Add Documents Done');
};

// indexDocument('./cg-knowledge-base.pdf');
