import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

// SSE
// special header
// send data in specail format of data stream like event stream

app.post('/chat', (req, res) => {
  //const { message } = req.body;

  const { query } = req.body;
  console.log(query);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  setInterval(() => {
    res.write('event: ping\n');
    res.write(`data: "${query}"\n\n`);
  }, 1000);
});

app.listen(4100, () => {
  console.log('Server is running on port 4100 Host: http://localhost:4100');
});
