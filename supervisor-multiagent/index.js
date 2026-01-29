
import dotenv from 'dotenv';
import { emailAgent, calendarAgent, contactAgent } from './agents.js';




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


const query = "Send the design team a reminder about reviewing the new mockups";

const stream = await emailAgent.stream({
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