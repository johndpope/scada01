var modules={};

//Init logger
  var winston = require('winston');
  var logger = new (winston.Logger)({
      level:'info',
      transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: './debug/service.log' })
      ]
    });
  logger.info('Start service');
//init WebFace
  var webs=require('./webserver.js')
  var web=new webs(1234,'service');
  logger.info('Web service loaded');
  var rtsocket = require('./rtsocket.js');
  const transport = rtsocket.start(web.http);
  logger.info('Websocket loaded');
  web.app.get('/getmodules',function(req,res)
  {
    var sres=JSON.stringify(modules);
    res.write(sres);
    res.end();
  });
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