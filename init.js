const http = require('http');
var webserver=require('./web_infr/webserver.js');

const hostname = '0.0.0.0';
const port = 8000;

const server = http.createServer(webserver.processRequest);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});