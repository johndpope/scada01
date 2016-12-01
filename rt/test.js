  const cluster = require('cluster');
  const http=require('http')
  process.send({ cmd: 'Test start' });
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  }).listen(8000);
process.send({ cmd: 'Web started on port 8000' });