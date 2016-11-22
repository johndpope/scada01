String.prototype.replaceAt = function (index, character) {
  return this.substr(0, index) + character + this.substr(index + character.length);
}
const net = require('net');
const util = require('util');
var events = require("events");
function dataAdapterf () {}

util.inherits(dataAdapterf, events.EventEmitter);
var da=new dataAdapterf();
module.exports.dataAdapter=da;
module.exports.startServer = function (port) {
  const server = net.createServer((c) => {
    // 'connection' listener
    console.log('client connected');
    c.on('end', () => {
      console.log('client disconnected');
    });
    c.on('data', (d) => {
      console.log('--------------------------')
      console.log('R.Data:' + hexString(d));
      var frame = readFrame(d)
      da.emit("data", frame);
      console.log(frame);
      processFrame(frame, c);
    })

    // c.pipe(c);
  });
  server.on('error', (err) => {
    throw err;
  });
  server.listen(2404, () => {
    console.log('server bound');
  });



}
function processFrame(frame, c) {
  if (frame.apci)
    processApci(frame, c);
  
}
function processApci(frame, c) {
  var buff = new Buffer(6);
  buff[0] = 104;
  buff[1] = 4;
  var b1 = '00000011';
  if (frame.test_fr == 'act')
    b1 = b1.replaceAt(0, '1');
  if (frame.stop_dt == 'act')
    b1 = b1.replaceAt(2, '1');
  if (frame.start_dt == 'act')
    b1 = b1.replaceAt(4, '1');
  buff[2] = parseInt(b1, 2)
  buff[3] = 0
  buff[4] = 0
  sendData(buff, c)
}
function sendData(buff, c) {
  var frame = readFrame(buff)
  console.log('--------------------------')
  console.log('S.Data:' + hexString(buff));
  console.log(frame);
  c.write(buff);

}
function hexString(arr, delim = ' ') {
  var res = '';
  for (var i = 0; i < arr.length; i++) {
    var hex = arr[i].toString(16);
    if (hex.length == 1)
      hex = '0' + hex;
    res = res + delim + hex;
  }
  //console.log(res)
  return res;
}
function readAPCI(res, buff) {
  var b1 = buff[2].toString(2);
  var len = b1.length
  if (len != 8) {
    for (var bi = 0; bi < 8 - len; bi++) {
      b1 = '0' + b1;
    }
  }
  res.apci = true;
  if (b1[0] == '1')
    res.test_fr = 'con';
  if (b1[1] == '1')
    res.test_fr = 'act';
  if (b1[2] == '1')
    res.stop_dt = 'con';
  if (b1[3] == '1')
    res.stop_dt = 'act';
  if (b1[4] == '1')
    res.start_dt = 'con';
  if (b1[5] == '1')
    res.start_dt = 'act';
  return res;
}
function readFrame(buff) {
  var res = {};
  if (buff[0] != 104)
  { throw "Not iec870-5-104"; }
  res.len = buff[1];
  if (res.len == 4)
    return readAPCI(res, buff);
  if (buff.length - 2 != res.len)
  { throw "Incorrect length"; }
  res.asdu_type = buff[6];
  if (res.asdu_type) {
    res.common_addres = parseInt(buff[9].toString(16) + buff[10].toString(16), 16);
    res.data_len = buff[7];
    res.cause = buff[8];
    res.data = [];
    var start_len = 11;
    for (var di = 0; di < res.data_len; di++) {
      var dataitem = {};
      dataitem.addres = buff[start_len].toString(16) + buff[start_len + 1].toString(16);
      var iee_arr = buff.slice(start_len + 4, start_len + 8);
      // iee_arr.push(buff[start_len+4])
      // iee_arr.push(buff[start_len+5])
      // iee_arr.push(buff[start_len+6])
      // iee_arr.push(buff[start_len+7])
      dataitem.value = getIEEE754(iee_arr);
      dataitem.qds = buff[start_len + 8].toString(16)
      dataitem.flags = getQDSflags(buff[start_len + 8])
      res.data.push(dataitem);
      start_len += 8;

    }

  }



  return res;

}

//00 00 80 3f
function getIEEE754(hex) {
  var res = 1;
  var S = hex[3] & 128;
  var E = 0;
  var M = 0;
  if (S == 128) {
    res = -res;
    E = hex[3] - S;

  }
  else {
    E = hex[3];
  }
  var expo = E.toString(2);
  var e = (hex[2] & 128) == 128 ? 1 : 0;
  expo += e;
  E = parseInt(expo, 2);
  var mantis = [];
  if (e == 0)
    mantis.push(hex[2]);
  else
    mantis.push(hex[2] - 128);
  mantis.push(hex[1]);
  mantis.push(hex[0]);
  //mantis=hex.slice(0,3);
  M = parseInt(hexString(mantis, ''), 16);
  res = res * Math.pow(2, E - 127) * (1 + M / Math.pow(2, 23));

  return res;
}
function getQDSflags(qds) {
  var flags = { OV: false, IV: false, NT: false, BL: false, SB: false };
  var str = qds.toString(2);
  if (str[0] == '1')
    flags.IV = true;
  if (str[1] == '1')
    flags.NT = true;

  if (str[2] == '1')
    flags.SB = true;

  if (str[3] == '1')
    flags.BL = true;

  if (str[7] == '1')
    flags.OV = true;

  return flags;
}