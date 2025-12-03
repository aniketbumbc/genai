import { HumanMessage } from '@langchain/core/messages';
import { graph } from './src/graph.js';

async function main() {
  const app = graph.compile();
  const result = await app.invoke({
    messages: [new HumanMessage('Write a post on react js')],
  });

  console.log(
    'Generated Post: ',
    result.messages[result.messages.length - 1].content
  );

  // console.log(result);
}

main();
