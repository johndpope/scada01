var modules=[];

//Init logger
  var winston = require('winston');
  var logger = new (winston.Logger)({
      level:'info',
      transports: [
        new (winston.transports.Console)({  handleExceptions: true,
    humanReadableUnhandledException: true }),
        new (winston.transports.File)({ filename: './debug/service.log',    handleExceptions: true,
    humanReadableUnhandledException: true })]
      
    });
  logger.exitOnError = false;
  logger.info('Start service');
//init WebFace
  var webs=require('./webserver.js')
  var web=new webs(1234,'service');
  web.on('log',sendLogExternal);
  logger.info('Web service loaded');
  var rtsocket = require('./rtsocket.js');

  var transport =new rtsocket(web.http);
  transport.on('log',sendLogExternal);
  logger.info('Websocket loaded');
  logger.stream({ start: -1 }).on('log', sendLog);
  function sendLog(log)
  {
    transport.io.json.send({ 'event': 'log','src':'service', 'data': log })
  }
  function sendLogExternal(log)
  {
    transport.io.json.send(log)
  }
  web.app.get('/getmodules',function(req,res)
  {
    var sres=JSON.stringify(modules);
    res.write(sres);
    res.end();
  });

  setInterval(function(){
    if(modules[0])
    {
      modules[0].state=modules[0].state==0?1:0;
   transport.io.json.send({ 'event': 'modules_upd', 'data': modules[0] });
    }
    
  },1000);

  web.app.get('/getlogs',function(req,res)
  {
      var options = {
    from: new Date - 24 * 60 * 60 * 1000,
    until: new Date,
    limit: 10,
    start: 0,
    order: 'desc',
    fields: ['message']
  }
    logger.query(options, function (err, results) {
      if (err) {
        throw err;
      }
      console.log(results);
      var sres=JSON.stringify(results);
      res.write(sres);
      res.end();
    });

  });
  transport.handles['get_modules']=function(msg,socket)
  {
    socket.json.send({ 'event': 'send_modules', data:modules});
  }
//mongo

  var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
  // Connection URL
  var url = 'mongodb://192.168.0.111:27017/scdme';
  // Use connect method to connect to the server
  winston.profile('mongo connect');
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
  loadModules(db)
    winston.profile('mongo connect');
  });
  var loadModules = function(db, callback) {
    // Get the documents collection
    var collection = db.collection('modules');
    // Find some documents
    winston.profile('mongo read modules');
    collection.find({}).each(function(err, docs) {
      assert.equal(err, null);
      if(docs){
      var a= {id:docs._id.toString(),name:docs.name,path:docs.path,state:'0',rule:{},args:docs.args};
      modules.push(a);
      logger.info(a)
      winston.profile('mongo read modules');
      }
      if(callback)
      callback(docs);
    })//.then(function(){winston.profile('mongo read modules');});
  }
/////