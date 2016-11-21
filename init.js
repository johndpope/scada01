const http = require('http');
var webserver=require('./web_infr/webserver.js');

const hostname = '192.168.0.111';
const port = 8000;

const server = http.createServer(webserver.processRequest);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});