var _mongo=require('mongodb')
 , assert = require('assert');
var winston = require('winston');
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
    if(process.send)
    process.send({ type: 'log',src:'dMaster',data:log});
}
logger.info('Start dMaster');
var url = 'mongodb://cstate.marikun.ru:443/scdme';
var url = 'mongodb://127.0.0.1:27017/scdme';
logger.info('Connecting to '+url);

_mongo.MongoClient.connect(url, function (err, db) {
  assert.equal(null, err);
  mongodb=db;
  logger.info('OK. Connected to mongodb...');
  readParams();
});

function readParams()
{
    logger.info('Reading data-collection for params..')
    mongodb.collections().then(function(cl)
    {
        cl.forEach((v)=>{
            if(v.s.name.indexOf('dta_')==0)
              logger.info(v.s.name);
        });
    
    });
 

}




