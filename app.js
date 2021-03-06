const util = require('util');
const cluster = require('cluster');
var model={
  modules:[],
  users:[]
}
class lmodule
{
  constructor(o) {
    this.id= o.id
    this.name= o.name
    this.path= o.path
    this.state= '0'
    this.rule= {}
    this.args= o.args 
  }
   setState(s){
    this.state=s;
    transport.io.json.send({ 'event': 'modules_upd', 'data':{id:this.id,name:this.name,path:this.path,desc:this.desc,args:this.args,state:this.state}});
  }
  
}
this.launchedModules={};
var mongodb={};
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
r_modules.events.on('new',(d)=>{
  logger.info('Create module',JSON.stringify(d));
  d.args={str:d.args};
  d.state=0;
  d.rule={};
  mongodb.collection('modules').insertOne(d);
  loadModules(mongodb,()=>{
    appl.model.modules.forEach((e)=>{
      transport.io.json.send({ 'event': 'modules_upd', 'data': e });
    })
  });
})
r_modules.events.on('edit',(d)=>{
  logger.info('Edit module',JSON.stringify(d));
  d.args={str:d.args};
  d.state=0;
  d.rule={};
  mongodb.collection('modules').updateOne({_id:new mongo.ObjectID(d.id)},d);
  loadModules(mongodb,(a)=>{
    
      transport.io.json.send({ 'event': 'modules_upd', 'data': a });
    
  });
})
r_modules.events.on('startstop',(d)=>{
  var m=getbyid(appl.model.modules,d.id);
  if(m.state==0)
  {  m.state=1;
    logger.info('Start module ',m.name);
    sup.add(m);
    //m.server
  }
  else
  {
    m.state=0;
    logger.info('Stop module ',m.name);
    sup.remove(m);
  }  
  transport.io.json.send({ 'event': 'modules_upd', 'data':{id:m.id,name:m.name,path:m.path,desc:m.desc,args:m.args,state:m.state}});
})
r_modules.events.on('delete',(d)=>{
  mongodb.collection('modules').deleteOne({_id:new mongo.ObjectID(d.id)},()=>{
  loadModules(mongodb,()=>{
     transport.io.json.send({ 'event': 'send_modules', data: appl.model.modules });
  })});
})
web.app.use('/modules', r_modules);


r_modules.model=appl.model;

///

setInterval(function () {
  if (appl.model.modules[0]) {
    appl.model.modules[0].state = appl.model.modules[0].state == 0 ? 1 : 0;
    for (var id in cluster.workers) {
      var wrk=cluster.workers[id];
      //logger.info('Modules Info: ',wrk.id);
       
    }
    
 //   transport.io.json.send({ 'event': 'modules_upd', 'data': appl.model.modules[0] });
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
  web.app.get('/bench',function (req, res) {
    bench();
    res.end();
  })
    web.app.get('/bench2',function (req, res) {
    bench_read();
    res.end();
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
var terminal_cmds=[];
terminal_cmds['mstart']=function(prm){
  
  var m=getbyfld(appl.model.modules,prm,'name');
  if(m.state==0)
  {  
    logger.info('Start module ',m.name);
    sup.add(m);
    //m.server
  }
  else
  {
    
    logger.info('Stop module ',m.name);
    sup.remove(m);
    }  
  transport.io.json.send({ 'event': 'modules_upd', 'data':{id:m.id,name:m.name,path:m.path,desc:m.desc,args:m.args,state:m.state}});


}
terminal_cmds['mstop']=function(prm){
  
  var m=getbyfld(appl.model.modules,prm,'name');
  if(m.state==0)
  {  
    logger.info('Start module ',m.name);
    sup.add(m);
    //m.server
  }
  else
  {
    
    logger.info('Stop module ',m.name);
    sup.remove(m);
    }  
  transport.io.json.send({ 'event': 'modules_upd', 'data':{id:m.id,name:m.name,path:m.path,desc:m.desc,args:m.args,state:m.state}});


}
transport.handles['terminal'] = function (msg, socket) {
  logger.info('terminal command '+msg.text);
  var spos=msg.text.indexOf(' ')
  var cmd=msg.text.substring(0,spos);
  var ag=msg.text.substring(spos+1);
  if(terminal_cmds[cmd])
  terminal_cmds[cmd](ag);
  else
  logger.info('Unknown command!');
  
}
//mongo
var mongo=require('mongodb');
var MongoClient = mongo.MongoClient
  , assert = require('assert');
// Connection URL
var url = 'mongodb://cstate.marikun.ru:443/scdme';
var url = 'mongodb://127.0.0.1:27017/scdme';
// Use connect method to connect to the server
winston.profile('mongo connect');
MongoClient.connect(url, function (err, db) {
  assert.equal(null, err);
  mongodb=db;
  loadModules(db)
  winston.profile('mongo connect');
});

var loadModules = function (db, callback) {
  appl.model.modules=[];
  // Get the documents collection
  var collection = db.collection('modules');
  db.collection('data').find({}).count((e,r)=>{
    logger.info('Total records in data - '+r);
  });
  // Find some documents

  collection.find({}).each(function (err, docs) {
    assert.equal(err, null);
    if ((docs)&&(docs.id!=0)) {
      var a = new lmodule({ id: docs._id.toString(), name: docs.name, path: docs.path, state: '0', rule: {}, args: docs.args });
      getbyfld(cluster.workers,a.id,'mid');
      appl.model.modules.push(a);
      logger.info(a)

    }
    if (callback)
      callback(a);
  })//.then(function(){winston.profile('mongo read modules');});
}
var cnt_bench=0;
function bench_read()
{
  winston.profile('mongo read data ');
  mongodb.collection('data').find({"ind":2,"dt":{"$gt":1480684452.100}},(error, result)=>{
    var aa=result.toArray((error, result)=>{
    winston.profile('mongo read data ','count '+result.length);
  });})
}
function bench()
{
 
  var cnt=100000;
  var cur=0;
  var d=mongodb.collection('data')
    setInterval(()=>{
    transport.io.json.send({ 'event': 'bench', data: {cnt:cnt_bench}});
    cnt_bench=0;
  },1000)
  function add(error, result)
  {
    d.insertOne({cat:'I',ind:2,value:cur,dt:Date.now() / 1000},()=>{
      cnt_bench++;
        cur++;
        if(cur<cnt)
        {
          add();
        }
    });


  }
  process.nextTick(()=>{    
      d.insertOne({cat:'I',ind:1,value:cur,dt:Date.now() / 1000},add)   
  });


}
/////supervisor


function supervisor(){
  this.workers=[];

  this.add=(m)=>
  {
    if(this.workers.indexOf(m)==-1)
    { cluster.setupMaster({
      exec:m.path});
      var wrk=cluster.fork();
      wrk.mid=m.id;
      wrk.on('exit', (code, signal) => {
        logger.info('Process '+m.path +' closed',{code:code,signal:signal})
         m.wrk_id=-1;
         m.setState(0); 

      });
      wrk.on('error', (e) => {
        logger.info('Process '+m.path +' error',{er:e})
      });
      wrk.on('online', () => {
        logger.info('Process '+m.path +' online')
        m.wrk_id=wrk.id;
        m.setState(1);
      });
      wrk.on('message', (ms) => {
        if(ms.type=='log')
          logger.info(m.path +' : ',ms.data.message)
      });
    
      return wrk;
    } 
  }
  this.remove=(m)=>{
    if((m.wrk_id!=-1)&&(cluster.workers[m.wrk_id]))
      cluster.workers[m.wrk_id].kill();


  }
}
var sup=new supervisor();

/////


function getbyid(arr, id) {
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i].id == id)
        return arr[i]; // Return as soon as the object is found
    }
    return null;
  }
function getbyfld(arr, id,fld='id') {
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i][fld] == id)
        return arr[i]; // Return as soon as the object is found
    }
    return null;
  }