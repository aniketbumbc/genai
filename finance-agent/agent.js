import dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const messages = [
  {
    role: 'system',
    content: `You are a smart, reliable, and privacy-conscious Finance Assistant AI. Your primary role is to help users manage their personal finances, track income and expenses, monitor account balances, and plan for short- and long-term financial goals. You provide clear, practical advice based on the user's input, current financial situation, and goals.
        current datetime:${new Date().toUTCString()}
You should:
Categorize and analyze income and expenses.
Provide summaries of spending habits and monthly reports.
Help set up and manage budgets.
Suggest ways to save money or reduce unnecessary expenses.
Forecast future balances based on spending patterns.
Assist with financial planning, including saving for specific goals (e.g., travel, home, emergency fund, retirement).
Explain financial concepts simply and clearly (e.g., budgeting, interest rates, debt management).
Remain non-judgmental, supportive, and respectful of users’ financial situations.
Protect user privacy and never assume or share sensitive information`,
  },
];

messages.push({
  role: 'user',
  content: 'how much expense i do this month',
});

const agentCall = async () => {
  while (true) {
    const llmResponse = await openai.chat.completions.create({
      messages: messages,
      model: 'gpt-4o-mini',
      tools: [
        {
          type: 'function',
          function: {
            name: 'getTotalExpense',
            description:
              'Returns the total expenses between a given start date (from) and end date (to).',
            parameters: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  description:
                    'Start date of the expense period in YYYY-MM-DD format.',
                },
                to: {
                  type: 'string',
                  description:
                    'End date of the expense period in YYYY-MM-DD format.',
                },
              },
              required: ['from', 'to'],
            },
          },
        },
      ],
    });

    //console.log(JSON.stringify(llmResponse.choices[0], null, 2));

    messages.push(llmResponse.choices[0].message);

    const isToolCalls = llmResponse.choices[0].message.tool_calls;

    if (!isToolCalls) {
      console.log(`Assistant: ${llmResponse.choices[0].message.content}`);
      break;
    }

    for (const tool of isToolCalls) {
      const functionName = tool.function.name;
      const funcArgs = tool.function.arguments;

      let result;

      if (functionName === 'getTotalExpense') {
        result = getTotalExpense(JSON.stringify(funcArgs));
        // console.log('result', result);
      }

      messages.push({
        role: 'tool',
        content: result,
        tool_call_id: tool.id,
      });

      // console.log('*****************************************');
      // console.log(`Assistant: ${llmResponse.choices[0].message.content}`);
      console.log('*****************************************');
      console.log('MESSAGES: ', messages);
    }
  }
};

agentCall();

/**
 *  Get total expense
 */

const getTotalExpense = ({ from, to }) => {
  console.log('Calling getTotal expense tool');

  return '150000';
};
