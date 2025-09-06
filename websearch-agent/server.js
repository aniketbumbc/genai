import express from 'express';
import cors from 'cors';
import { generateMessage } from './chatbot.js';

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to ChatBot');
});

app.post('/chat', async (req, res) => {
  const { message, threadId } = req.body;
  // Need to validate message and thredId filed

  const result = await generateMessage(message, threadId);

  res.json({ message: result });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
