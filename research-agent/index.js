import app from './src/graph.js';

import readline from 'node:readline/promises';  
import dotenv from 'dotenv';
dotenv.config();



const main = async () => {

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });


  while (true) {
    const query = await rl.question('User: ');
    if (query === 'bye') break;


  console.log('\n🤔 thinking...');

  const result = await app.invoke({ messages: [{ role: 'user', content: query }] });
  console.log("=".repeat(100));
  console.log("Final Answer: ");
  console.log("=".repeat(100));
  
  // Parse the last message content to extract the answer field
  const lastMessage = result.messages[result.messages.length - 1];
  let answerContent;
  
  try {
    const parsedContent = JSON.parse(lastMessage.content);
    answerContent = parsedContent.answer || lastMessage.content;
  } catch (e) {
    // If parsing fails, use content as-is
    answerContent = lastMessage.content;
  }
  
  console.log(answerContent);
}
rl.close();
};

main();