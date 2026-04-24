import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { DatabaseSync } from 'node:sqlite';

export const initTools = (db: DatabaseSync) => {
  /***
   * add_expense
   * description: Add a new expense to the expense tracker
   * parameters:
   * - title: The title of the expense
   * - amount: The amount of the expense
   */

  const addExpense = tool(
    ({ title, amount }) => {
      console.log(`Adding expense: ${title} - $${amount}`);

      // todo validation data type
      // todo error handling

      const date = new Date().toISOString().split('T')[0];
      const statement = `INSERT INTO expenses (title, amount, date) VALUES (?, ?, ?)`;
      db.prepare(statement).run(title, amount, date);

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

  /***
   * get_expenses
   * description: Get all expenses from the expense tracker
   * parameters:
   * - None
   */

  const getExpenses = tool(
    ({ fromDate, toDate }) => {
      console.log(`Getting expenses from ${fromDate} to ${toDate}`);

      // todo validation data type
      // todo error handling

      const statement = `SELECT * FROM expenses WHERE date BETWEEN ? AND ?`;
      const expenses = db.prepare(statement).all(fromDate, toDate);
      console.log(expenses);

      return JSON.stringify(expenses);
    },
    {
      name: 'get_expenses',
      description:
        'Get the total amount of expenses from the database between two dates',
      schema: z.object({
        fromDate: z
          .string()
          .describe('The start date of the expense YYYY-MM-DD'),
        toDate: z.string().describe('The end date of the expense YYYY-MM-DD'),
      }),
    },
  );

  return [addExpense, getExpenses];
};
