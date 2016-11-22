const http = require('http');
var webserver = require('./web_infr/webserver.js');
var rtsocket = require('./rtsocket.js');
const transport=rtsocket.start();
var perfmon = require('perfmon');
var iec104 = require('./iec104.js');
var platform = require('os').platform(),
    execFile = require('child_process').execFile,
    path = require('path');
var TotalMemory = {};
iec104.startServer(2404);
const hostname = '0.0.0.0';
const port = 8000;
const server = http.createServer(webserver.processRequest);
totalmem();
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
perfmon(['\\238(_total)\\6', '\\Память\\Доступно МБ'], function (err, data) {
  transport.json.send({ 'event': 'perfmon', 'type': 'summary', 'tmem': TotalMemory, 'data': data })
});
iec104.dataAdapter.on('data', function (d) {
  transport.json.send({ 'event': 'iec104', 'type': 'R_frame', 'data': d })

})
rtsocket.callbacks.connect=function(sckt)
{
  var m=smodules;
sckt.json.send({'event': 'modules', 'data': smodules});
}





function totalmem() {
  var wmic = platform === 'win32' ? path.join(process.env.SystemRoot, 'System32', 'wbem', 'wmic.exe') : null;
  execFile(wmic, ['memorychip', 'get', 'capacity'], function (error, res, stderr) {
    if (error !== null || stderr) return 0;
    var cpus = (res.match(/\d+/g) || []).map(function (x) {
      return +(x.trim());
    });
    TotalMemory = cpus;
  });
};

var _module = function () {
  this.name = '-mod_name-';
  this.path = '-mod_path-';
  this.args = ['run'];
  this.type = 'bin'
  this._obj = {}
  this.state = 0;
  this.start = function () {
    if (this.type == 'bin') {
      startbin(this);
      return;
    }
    if (!obj) {
      obj = require(this.path);
      obj = new obj(this.args);
      obj.mstart();
      return
    }
    else {
      if (this.state != 0) {
        obj.mstart();
      }
      else {
        return { state: -1, message: 'Already started' };
      }
    }
  }
  function startbin(sb) {
     execFile(sb.path, sb.args, function (error, res, stderr) {
      console.log('error',error);
      console.log('res',res);
      console.log('stderror',stderr); 
      sb.state=0;   
      transport.json.send({'event': 'modules_upd', 'data': sb});
  });sb.state=1;

  }
}

var iec1 = new _module();
iec1.name = "iec1";
iec1.path = 'ping';
iec1.args = ['ya.ru','-t']
iec1.type='bin';
iec1.start();

var iec2 = new _module();
iec2.name = "iec2";
console.log(iec1, iec2);
var smodules=[];
smodules.push(iec1);
smodules.push(iec2);