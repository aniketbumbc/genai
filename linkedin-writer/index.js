import readline from 'node:readline/promises';
import { HumanMessage } from '@langchain/core/messages';
import { graph } from './src/graph.js';

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const app = graph.compile();
  let result;
  while (true) {
    const query = await rl.question('What you want to write?\n');
    if (query === 'bye') break;

    result = await app.invoke({
      messages: [new HumanMessage(query)],
    });
    console.log(
      'Generated Post: ',
      result.messages[result.messages.length - 1].content
    );
  }

  rl.close();
}

main();
