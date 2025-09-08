import dotenv from 'dotenv';
import OpenAI from 'openai';
import readline from 'node:readline/promises';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const expenseDb = [];
const incomeDb = [];

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

const agentCall = async () => {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // prompt loop
  while (true) {
    const question = await rl.question('User : ');

    if (question === 'bye') {
      break;
    }

    messages.push({
      role: 'user',
      content: question,
    });

    // llm loop
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
          {
            type: 'function',
            function: {
              name: 'addExpense',
              description: 'Add new expense entry to the expense database',
              parameters: {
                type: 'object',
                properties: {
                  amount: {
                    type: 'string',
                    description:
                      'amount use for expense. Example: - Bought i phone',
                  },
                  name: {
                    type: 'string',
                    description:
                      'the reason to the expense for. Example: - 5000',
                  },
                },
                required: ['name', 'amount'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'addIncome',
              description: 'Add new income entry to the income database',
              parameters: {
                type: 'object',
                properties: {
                  amount: {
                    type: 'string',
                    description: 'amount use for income. Example: - 5000',
                  },
                  name: {
                    type: 'string',
                    description:
                      'the reason to the income for. Example: - Got salary or Got refund from tax',
                  },
                },
                required: ['name', 'amount'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'getTotalBalance',
              description: 'You see total balance from database',
            },
          },
        ],
      });

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
          result = getTotalExpense(JSON.parse(funcArgs));
        } else if (functionName === 'addExpense') {
          result = addExpense(JSON.parse(funcArgs));
        } else if (functionName === 'addIncome') {
          result = addIncome(JSON.parse(funcArgs));
        } else if (functionName === 'getTotalBalance') {
          result = getTotalBalance();
        }

        messages.push({
          role: 'tool',
          content: result,
          tool_call_id: tool.id,
        });
      }
    }
  }

  rl.close();
};

agentCall();

/**
 *  Get total expense
 */

const getTotalExpense = ({ from, to }) => {
  // console.log('Calling getTotal expense tool');

  const expense = expenseDb.reduce((acc, item) => {
    return acc + item.amount;
  }, 0);

  return `${expense} INR`;
};

/**
 *  Add expense function
 */

const addExpense = ({ name, amount }) => {
  console.log(` Adding amount to db ${name} and ${amount}`);
  expenseDb.push({ name, amount });

  return 'Expenses Added to database';
};

/**
 *  Add income to db function
 */

const addIncome = ({ name, amount }) => {
  console.log(` Adding amount to income ${name} and ${amount}`);
  incomeDb.push({ name, amount });

  return 'Income Added to database';
};

/**
 *  Get total balance
 *
 */

const getTotalBalance = () => {
  const totalIncome = incomeDb.reduce((acc, item) => {
    return acc + item.amount;
  }, 0);

  const totalExpense = expenseDb.reduce((acc, item) => {
    return acc + item.amount;
  }, 0);

  const totalBalance = totalIncome - totalExpense;

  return `You account has total balance is ${totalBalance} INR`;
};
