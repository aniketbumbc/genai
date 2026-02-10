
import dotenv from 'dotenv';
import { emailAgent, calendarAgent, contactAgent } from './agents.js';
import { supervisorAgent } from './superVisor.js';
import readline from 'node:readline/promises';




dotenv.config();

async function main() {
// const query = "Schedule a team meeting next Tuesday at 2pm for 1 hour. there is no attendees now. You can just create the event without any attendees.";
// const stream = await calendarAgent.stream({
//   messages: [{ role: "user", content: query }]
// });

// for await (const step of stream) {
//   for (const update of Object.values(step)) {
//     if (update && typeof update === "object" && "messages" in update) {
//       for (const message of update.messages) {
//         console.log(message.toFormattedString());
//       }
//     }
//   }
// }


// const query = "Send the design team a reminder about reviewing the new mockups";

// const stream = await emailAgent.stream({
//   messages: [{ role: "user", content: query }]
// });

// for await (const step of stream) {
//   for (const update of Object.values(step)) {
//     if (update && typeof update === "object" && "messages" in update) {
//       for (const message of update.messages) {
//         console.log(message.toFormattedString());
//       }
//     }
//   }
// }

// const query = " What is email and name of sales team?"
// const stream = await contactAgent.stream({
//   messages: [{ role: "user", content: query }]
// });

// for await (const step of stream) {
//   for (const update of Object.values(step)) {
//     if (update && typeof update === "object" && "messages" in update) {
//       for (const message of update.messages) {
//         console.log(message.toFormattedString());
//       }
//     }
//   }
// }


const config = {configurable: {thread_id: '42'}};


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const interrupts = [];

while (true) {
  const query = await rl.question('Enter your query: ');
  if (query === 'bye') break;

const result = await supervisorAgent.invoke({
  messages: [{ role: "user", content: query }]
}, config);

let output_format = '';

if(result?.__interrupt__){
  interrupts.push(result?.__interrupt__[0]);
  // show to the approval message

output_format += result?.__interrupt__[0].value.actionRequests[0].description + '\n\n';
output_format += "To: " + result?.__interrupt__[0].value.actionRequests[0].args.to + '\n';
output_format += "Subject: " + result?.__interrupt__[0].value.actionRequests[0].args.subject + '\n';
output_format += "Body: " + result?.__interrupt__[0].value.actionRequests[0].args.body + '\n';
output_format += '\n' + 'Choose the action to take:' + '\n';
output_format += '1. approve: Approve the email to be sent.' + '\n';
output_format += '2. edit: Edit the email and send it again.' + '\n';
output_format += '3. reject: Reject the email and do not send it.' + '\n';

console.log(output_format);


}else{
  console.log("result: ", (result.messages[result.messages.length - 1].content));
}

//console.log("result: ", JSON.stringify(result?.__interrupt__));


}
rl.close();
}
main();


//https://docs.langchain.com/oss/javascript/langchain/multi-agent/subagents-personal-assistant#why-use-a-supervisor