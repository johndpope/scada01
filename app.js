var modules={};

//Init logger
  var winston = require('winston');
  var logger = new (winston.Logger)({
      level:'info',
      transports: [
        new (winston.transports.Console)(),
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
  //setInterval(function(){logger.info('test');},1000);
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
    collection.find({}).toArray(function(err, docs) {
      assert.equal(err, null);
      for(var m in docs)
          logger.info(docs[m])
      modules=docs;
      winston.profile('mongo read modules');
      if(callback)
      callback(docs);
    });
  }
/////