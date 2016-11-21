const http = require('http');
var webserver=require('./web_infr/webserver.js');
var rtsocket=require('./rtsocket.js').start();
var cpu = require('windows-cpu');

const hostname = '0.0.0.0';
const port = 8000;

const server = http.createServer(webserver.processRequest);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
cpuLoadTimer();
function cpuLoadTimer()
{
  cpu.totalLoad(function(error, results) {
    if(error) {
    return console.log(error);
    }
    rtsocket.emit({'event': 'cpuCounterLoad', 'data': results})
setTimeout(cpuLoadTimer,1000);
    // results (single cpu in percent) =>
    // [8]

    // results (multi-cpu in percent) =>
    // [3, 10]
});
}