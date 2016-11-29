
var model={
  modules:[],
  users:[]
}
var appl=this;
const fs = require('fs');
//Init logger
var winston = require('winston');
var logger = new (winston.Logger)({
  level: 'info',
  transports: [
    new (winston.transports.Console)({
      handleExceptions: true,
      humanReadableUnhandledException: true
    }),
    new (winston.transports.File)({
      filename: './debug/service.log', handleExceptions: true,
      humanReadableUnhandledException: true
    })]

});
logger.exitOnError = false;
logger.info('Start service');
//init WebFace
var webs = require('./webserver.js')
var web = new webs(1234, 'service');
web.on('log', sendLogExternal);
logger.info('Web service loaded');
var rtsocket = require('./rtsocket.js');

var transport = new rtsocket(web.http);
transport.on('log', sendLogExternal);
logger.info('Websocket loaded');
logger.stream({ start: -1 }).on('log', sendLog);
function sendLog(log) {
  transport.io.json.send({ 'event': 'log', 'src': 'service', 'data': log })
}
function sendLogExternal(log) {
  transport.io.json.send(log)
}
//web modules init
Object.defineProperty(appl,"model",{set:(v)=>{model=v;synchData()},get:()=>{return model;}});
var r_modules = require('./routers/modules');
web.app.use('/modules', r_modules);


r_modules.model=appl.model;

///

setInterval(function () {
  if (appl.model.modules[0]) {
    appl.model.modules[0].state = appl.model.modules[0].state == 0 ? 1 : 0;
    
    transport.io.json.send({ 'event': 'modules_upd', 'data': appl.model.modules[0] });
  }

}, 1000);
web.app.get('/getlogslist', function (req, res) {
  var files = fs.readdirSync('./debug').filter(function (file) { return file.substr(-4) === '.log'; });
  var sres = JSON.stringify(files);
  res.write(sres);
  res.end();
})
var copyRecursiveSync = function(src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (exists && isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(src+'/'+ childItemName,
                        dest+'/'+  childItemName);
    });
  } else {
    fs.linkSync(src, dest);
  }
};
var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
web.app.get('/download_all_logs',function(req,res){
    var zipPaths = require('zip-paths');
    deleteFolderRecursive('./logs');
    copyRecursiveSync('./debug','./logs')
   // fs.unlinkSync('logs.zip');
    zip = new zipPaths('logs.zip');
    var path=__dirname.toString().substring(2);
    zip.add('logs/*.*',{cwd:'.'}, function(err) {
        if (err) { /* handle error */ }
        zip.compress(function(err, bytes) {
              console.log("wrote %s bytes", bytes)
              res.setHeader('Content-disposition', 'attachment; filename=debug.zip');
              res.setHeader('Content-type', 'application/zip');
              var filestream = fs.createReadStream('./logs.zip');
              filestream.pipe(res)
              
          });
});

  })
web.app.post('/getlogs', function (req, res) {
  var file = req.body.file;
  if (fs.existsSync('./debug/' + file)) {
    var logg = new (winston.Logger)({
      transports: [
        new (winston.transports.File)({
          filename: './debug/' + file,
          timestamp: true
        })
      ]
    });
    var options = {
      from: new Date - 24 * 60 * 60 * 1000,
      until: new Date,
      limit: 10,
      start: 0,
      order: 'desc',
      fields: ['message','timestamp']
    }
    logg.query(options, function (err, results) {
      if (err) {
        throw err;
      }
      console.log(results);
      var sres = JSON.stringify(results);
      res.write(sres);
      res.end();
    });
  }
  else {
    res.write('NO DATA');
    res.end();
  }

});
transport.handles['get_modules'] = function (msg, socket) {
  socket.json.send({ 'event': 'send_modules', data: appl.model.modules });
}
//mongo

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
// Connection URL
var url = 'mongodb://192.168.0.111:27017/scdme';
// Use connect method to connect to the server
winston.profile('mongo connect');
MongoClient.connect(url, function (err, db) {
  assert.equal(null, err);
  loadModules(db)
  winston.profile('mongo connect');
});
var loadModules = function (db, callback) {
  // Get the documents collection
  var collection = db.collection('modules');
  // Find some documents
  winston.profile('mongo read modules');
  collection.find({}).each(function (err, docs) {
    assert.equal(err, null);
    if (docs) {
      var a = { id: docs._id.toString(), name: docs.name, path: docs.path, state: '0', rule: {}, args: docs.args };
      appl.model.modules.push(a);
      logger.info(a)
      winston.profile('mongo read modules');
    }
    if (callback)
      callback(docs);
  })//.then(function(){winston.profile('mongo read modules');});
}


/////