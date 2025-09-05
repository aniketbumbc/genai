import express from 'express';
import cors from 'cors';
import { chat } from './chat.js';

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to Company Chat Bot');
});

app.post('/api/assistant', async (req, res) => {
  const { question } = req.body;
  // Need to validate message and thredId filed

  const result = await chat(question);

  res.json({ Assistant: result });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
