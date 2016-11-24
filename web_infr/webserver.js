
var url = require('url');
var express=require('express');
const util = require('util');
var events = require("events");
function dataAdapterf () {}
util.inherits(dataAdapterf, events.EventEmitter);
var da=new dataAdapterf();
module.exports.eventgate=da;
var app=express();
const http = require('http').Server(app);
var fs = require('fs');
var functs = {};
const hostname = '0.0.0.0';
const port = 1234;
//const http = http.createServer(webserver.processRequest);
app.use(express.static('www'));
app.set('view engine', 'pug');
app.get(/\/div_/, function (req, res) {
    var type=req.originalUrl.substring(5);
  res.render(type, { title: 'Hey', message: 'Hello there!' })
})
app.get('/bench',function(req,res)
{
  var test=[];
  var cnt=1000000;
  for(var i=0;i<cnt;i++)
  {    
    var tdata={id:i,value:0.2,flag:0x200};
    da.emit("wdata", tdata);
    test.push(tdata);
  }
  res.write(JSON.stringify(test));
  res.end();
})


http.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


module.exports.http=http;
module.exports.app=app;
