import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const main = async () => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 1,
    // top_p: 0.2,
    // stop: 'ral',
    // max_completion_tokens: 1000,
    // max_tokens:1000,
    messages: [
      {
        role: 'system',
        content: ` You are Bunny, You are a sentiment analysis assistant.
           Given any product review, respond with only one word:
         "positive", "negative", or "neutral" — depending on the overall sentiment of the review.
         Do not include any explanations, punctuation, or extra words.`,
      },
      {
        role: 'user',
        content: `Review: The headphone sound quality is okkiesh class.
                Sentiment:`,
      },
    ],
  });

  console.log(response.choices[0].message.content);
  //   console.log(response);
};

main();

//https://console.groq.com/docs/overview
