import { DatabaseSync } from 'node:sqlite';
export const initDb = (dbPath) => {
  const db = new DatabaseSync(dbPath);

  const query = `
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL
    )
  `;
  db.exec(query);

  return db;
};
