
var format = require('string-format')
format.extend(String.prototype);
var log = require('./logwriter.js').write;
log('supervisor', '');
log('supervisor', 'Start system');
log('supervisor', 'Load modules');
var webserver = require('./web_infr/webserver.js');
log('supervisor', '\t webserver loaded');
var rtsocket = require('./rtsocket.js');
log('supervisor', '\t rtsocket loaded');
const transport = rtsocket.start(webserver.http);
var perfmon = require('perfmon');
log('supervisor', '\t perfmon loaded');
var iec104 = require('./iec104.js');
log('supervisor', '\t iec104 loaded');
const odata = new (require('./odata.js'))(log);
var platform = require('os').platform(),
    execFile = require('child_process').execFile,
    path = require('path');
  var TotalMemory = {};


  iec104.startServer(2404);
  totalmem();
  perfmon(['\\238(_total)\\6', '\\Память\\Доступно МБ'], 'sokhavp', function (err, data) {
    transport.json.send({ 'event': 'perfmon', 'type': 'summary', 'tmem': TotalMemory, 'data': data })
  });
  iec104.dataAdapter.on('data', function (d) {
    transport.json.send({ 'event': 'iec104', 'type': 'R_frame', 'data': d })

  })

  webserver.eventgate.on('wdata', function (d) {
    for (var a in d) {
      odata.writeOI('I', 1, 200, 0x100, '01.01.01', '01.01.01');
    }
  })
  rtsocket.callbacks.connect = function (sckt) {
    var m = smodules;
    sckt.json.send({ 'event': 'modules', 'data': smodules });
  }
  log.callback = function (s) {
    transport.json.send({ 'event': 'mLogLine', 'data': s })
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
    this.id = '0001',
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
        console.log('error', error);
        console.log('res', res);
        console.log('stderror', stderr);
        sb.state = 0;
        transport.json.send({ 'event': 'modules_upd', 'data': sb });
        log('supervisor', 'Module {0} stoped.'.format(sb.name));
      }); sb.state = 1;
      var str = '';
      for (var ai = 0; ai < sb.args.length; ai++)
        str += sb.args[ai] + ' ';
      log('supervisor', 'Start module {0} - {1} {2}'.format(sb.name, sb.path, str));

    }
  }

  var iec1 = new _module();
  iec1.name = "iec1";
  iec1.path = 'ping';
  iec1.args = ['ya.ru', '-t']
  iec1.type = 'bin';
  iec1.id = '987';
  iec1.start();

  var iec2 = new _module();
  iec2.name = "iec2";
  var smodules = [];
  smodules.push(iec1);
  smodules.push(iec2);

  function getbyid(arr, id) {
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i].id == id)
        return arr[i]; // Return as soon as the object is found
    }
    return null;
  }