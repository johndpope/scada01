const util = require('util');
var events = require("events");
module.exports=function(port=1234,name='noname'){
var winston = require('winston');
var logger = new (winston.Logger)({
    level:'info',
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: './debug/web_engine_'+name+'.log' })
    ]
  });
  var th=this;
logger.stream({ start: -1 }).on('log', function(log) {
    th.emit('log',{ 'event': 'log','src':'web_engine_'+name,'data': log.data });
  });
var url = require('url');
var express=require('express');
var app=express();
const http = require('http').Server(app);
var fs = require('fs');
var functs = {};
const hostname = '0.0.0.0';
//const http = http.createServer(webserver.processRequest);
var bodyParser = require('body-parser')
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(express.static('www'));
app.set('view engine', 'pug');
app.get(/\/div_/, function (req, res) {
    var type=req.originalUrl.substring(5);
  res.render(type, { title: 'Hey', message: 'Hello there!' })
})
app.get('/bench',function(req,res)
{
  console.log('start gen')
  var test=[];
  var cnt=1000000;
  var temp=[];
  for(var i=0;i<cnt;i++)
  {    
    var tdata={id:i,value:0.2,flag:0x200};
    temp.push(tdata);
    if(temp.length=10000)
    {
      da.emit("wdata",temp);
      temp=[];
    }    
    test.push(tdata);
  }
  //res.write(JSON.stringify(test));
  res.end();
  console.log('end gen')
})


http.listen(port, hostname, () => {
  logger.log('info',`Server running at http://${hostname}:${port}/`);
});

this.http=http;
this.app=app;

}
util.inherits(module.exports, events.EventEmitter);

