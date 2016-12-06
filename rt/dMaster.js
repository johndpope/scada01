try{

var _mongo = require('mongodb')
    , assert = require('assert');
var uuid = require('node-uuid');;
var winston = require('winston');
var queue = require('queue');



var logger = new (winston.Logger)({
    level: 'info',
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: './debug/dMaster.log' })
    ]
});
logger.info(' ');
logger.stream({ start: -1 }).on('log', sendLog);
function sendLog(log) {
    if (process.send)
        process.send({ type: 'log', src: 'dMaster', data: log });
}
logger.info('Start dMaster');
var url = 'mongodb://cstate.marikun.ru:443/scdme';
var url = 'mongodb://127.0.0.1:27017/scdme';
var data = {};
logger.info('Connecting to ' + url);

_mongo.MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    mongodb = db;
    logger.info('OK. Connected to mongodb...');
    readParams();
});

function readParams() {
    logger.info('Reading data-collection for params..')
    var clts = [];
    mongodb.collections().then(function (cl) {
        for (var v in cl) {
            if (cl[v].s.name.indexOf('dta_') == 0) {
                logger.info(cl[v].s.name);
                clts.push(cl[v].s.name);
            }
        }
        data = new dData(clts);

    });


}
commands = [];
commands['read'] = function (prms) {
    var r=data.readData(prms.plist);
    return { resultCode: 0,result:r}
}
commands['write'] = function (prms) {
    return { resultCode: 0 }
}
commands['subs'] = function (prms) {
    return { resultCode: 0 }
}
commands['evflt'] = function (prms) {
    return { resultCode: 0 }
}


var wsserver = require('socket.io')(9401);
wsserver.set('transports', ['websocket']);
wsserver.sockets.on('connection', function (socket) {
    logger.info('Client %s (%s) connected', socket.id, socket.conn.remoteAddress)
    socket.on('message', function (msg) {
        //logger.info('%s : %j',socket.id,msg)
        var time = (new Date).toLocaleTimeString();
        msg.uuid = uuid.v1();
        if (commands[msg.cmd]) {

            var res = commands[msg.cmd](msg);
            socket.json.send({ 'event': 'ANSW', 'qid': msg.uuid, 'sid': msg.id, 'time': time, 'data': res });

        }
        else
            socket.json.send({ 'event': 'E_UKN_CMD', 'qid': msg.uuid, 'sid': msg.id, 'time': time });
    });
});
function queueWrite(data) { }
class dData {
    constructor(params) {
        this.data = [];
        this.queue = queue();
    }
    writeData() {

        this.queue.push()
    }
    readData() {

    }

}








}
catch(e)
{
        if (process.send)
       { process.send({ type: 'log', src: 'dMaster', data:{ message:e.message }});
       var cluster=require('cluster');
       cluster.worker.kill();
       }
}