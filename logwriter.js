var fs = require('fs');
var util = require('util');
var logFile = fs.createWriteStream('log.txt', { flags: 'a' });
var callback=function(s){};

var logs={};
function writeLog(type,message)
{
    var dt=new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    if(!logs[type])
        logs[type]=fs.createWriteStream('debug/'+type+'.log', { flags: 'a' });  
    if(message=='')
        dt='';
        logs[type].write(dt+'\t'+message + '\n');
    callback(dt+'\t'+message + '\n')   
}
exports.write=writeLog;
exports.callback=callback;
