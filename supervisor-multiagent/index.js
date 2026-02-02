
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

while (true) {
  const query = await rl.question('Enter your query: ');
  if (query === 'bye') break;
  const stream = await supervisorAgent.stream({
    messages: [{ role: "user", content: query }],
    config: config
  });
  for await (const step of stream) {
    for (const update of Object.values(step)) {
      if (update && typeof update === "object" && "messages" in update) {
        for (const message of update.messages) {
          console.log(message.toFormattedString());
        }
      }
    }
  }
}





rl.question('Enter your query: ', async (query) => {
  const stream = await supervisorAgent.stream({
    messages: [{ role: "user", content: query }]
  });
});

const query = ` Schedule a team meeting for tomorrow at 9am for 15 minutes at town hall. Include sales and marketing team members. about the new product launch. `



const stream = await supervisorAgent.stream({
  messages: [{ role: "user", content: query }]
});

for await (const step of stream) {
  for (const update of Object.values(step)) {
    if (update && typeof update === "object" && "messages" in update) {
      for (const message of update.messages) {
        console.log(message.toFormattedString());
      }
    }
  }
}

}

main();


//https://docs.langchain.com/oss/javascript/langchain/multi-agent/subagents-personal-assistant#why-use-a-supervisor