import dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const agentCall = async () => {
  const llmResponse = await openai.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: 'what is use of java',
      },
    ],
    model: 'gpt-4o-mini',
  });

  console.log(llmResponse.choices[0].message.content);
};

agentCall();
