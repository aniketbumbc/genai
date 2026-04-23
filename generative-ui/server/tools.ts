import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { DatabaseSync } from 'node:sqlite';

export const initTools = (db: DatabaseSync) => {
  const addExpense = tool(
    ({ title, amount }) => {
      console.log(`Adding expense: ${title} - $${amount}`);

      return JSON.stringify({
        success: true,
        message: `Expense ${title} added successfully`,
      });
    },
    {
      name: 'add_expense',
      description: 'Add a new expense to the expense tracker',
      schema: z.object({
        title: z.string().describe('The title of the expense'),
        amount: z.number().describe('The amount of the expense'),
      }),
    },
  );

  return [addExpense];
};
