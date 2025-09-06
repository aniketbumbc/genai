import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const inputTerminalContent = process.argv.slice(2).join(' ');

const main = async () => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 1,
    // top_p: 0.2,
    // stop: 'ral',
    // max_completion_tokens: 1000,
    // max_tokens:1000,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: ` You are Bunny, You are a sentiment analysis assistant.
           Given any product review, respond with only one word:
         "Positive", "Negative", or "Neutral" — depending on the overall sentiment of the review.
          You must return result valid json example like {"Sentiment": "Positive", "Id": "1"} or {"Sentiment": "Negative", "Id": "2"} or {"Sentiment": "Neutral", "Id": "3"}
          please check id also. Like for Positive Id = 1 and Negative Id = 2 and Neutral Id = 3. Make sure each sentiment has associate Id
         `,
      },
      {
        role: 'user',
        content: inputTerminalContent,
      },
    ],
  });

  console.log(JSON.parse(response.choices[0].message.content));
};

main();

//https://console.groq.com/docs/overview
