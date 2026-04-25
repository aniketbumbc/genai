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

  /**
   *  Generate expense chart
   */

  const generateExpenseChart = tool(
    ({ fromDate, toDate, groupByData }) => {
      console.log(`generateExpenseChart`);

      console.log(`by grouping by ${groupByData}`);

      let sqlGroupBy = '';

      switch (groupByData) {
        case 'month':
          sqlGroupBy = `strftime('%Y-%m', date)`;
          break;
        case 'week':
          sqlGroupBy = `strftime('%Y-W%W', date)`;
          break;
        case 'date':
          sqlGroupBy = `strftime('%Y-%m-%d', date)`;
          break;
        default:
          sqlGroupBy = `strftime('%Y-%m', date)`;
      }

      // todo validation data type
      // todo error handling

      const statement = `SELECT ${sqlGroupBy} as period, SUM(amount) as total FROM expenses WHERE date BETWEEN ? AND ? GROUP BY period ORDER BY period`;
      const expenses = db.prepare(statement).all(fromDate, toDate);
      console.log('rows of expenses', expenses);

      return JSON.stringify(expenses);
    },
    {
      name: 'generate_expense_chart',
      description:
        'Generate expense chart by query database and grouping expenses by month or week or year or date',
      schema: z.object({
        fromDate: z
          .string()
          .describe('The start date of the expense YYYY-MM-DD'),
        toDate: z.string().describe('The end date of the expense YYYY-MM-DD'),
        groupByData: z
          .enum(['date', 'week', 'month', 'year'])
          .describe(
            'How to group the expenses data: by month or week or year or date',
          ),
      }),
    },
  );

  return [addExpense, getExpenses, generateExpenseChart];
};
