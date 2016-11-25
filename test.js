console.log('start');
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers.
   var a=null
   cluster.setupMaster({
  exec: 'init.js'  
  
});
 a= cluster.fork();
 

  cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });


  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died');
    cluster.fork();
  });
} else {
  // Worker processes have a http server.
  
  http.Server(function(req, res) {
    res.writeHead(200);
    res.end("hello world\n");
  }).listen(8000);
}