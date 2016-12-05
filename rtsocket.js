var clbks = {};
const util = require('util');
var events = require("events");

module.exports = function (http,name="noname") {
	var winston = require('winston');
	var logger = new (winston.Logger)({
		level: 'info',
		transports: [
			new (winston.transports.Console)(),
			new (winston.transports.File)({ filename: './debug/web_socket_'+name+'.log' })
		]
	});
	this.callbacks = clbks;
	var wsserver = require('socket.io');
	var io = wsserver(http);
	///io.listen(1234); 

	io.set('transports', ['websocket']);
	// Отключаем вывод полного лога - пригодится в production'е
	var th=this;
	this.handles=[];
	// Навешиваем обработчик на подключение нового клиента
	io.sockets.on('connection', function (socket) {
		logger.info('Client %s (%s) connected',socket.id,socket.conn.remoteAddress)
		// Т.к. чат простой - в качестве ников пока используем первые 5 символов от ID сокета
		var ID = (socket.id).toString().substr(0, 5);
		var time = (new Date).toLocaleTimeString();
		// Посылаем клиенту сообщение о том, что он успешно подключился и его имя
		socket.json.send({ 'event': 'connected', 'name': ID, 'time': time });
		// Посылаем всем остальным пользователям, что подключился новый клиент и его имя
		socket.broadcast.json.send({ 'event': 'userJoined', 'name': ID, 'time': time });
		// Навешиваем обработчик на входящее сообщение
		socket.on('message', function (msg) {
			//logger.info('%s : %j',socket.id,msg)
			var time = (new Date).toLocaleTimeString();
			if(th.handles[msg.event])
			{
				th.handles[msg.event](msg,socket);
			}
			// Уведомляем клиента, что его сообщение успешно дошло до сервера
			socket.json.send({ 'event': 'messageSent', 'name': ID, 'text': msg, 'time': time });
			// Отсылаем сообщение остальным участникам чата
			socket.broadcast.json.send({ 'event': 'messageReceived', 'name': ID, 'text': msg, 'time': time })
		});
		// При отключении клиента - уведомляем остальных
		socket.on('disconnect', function () {
			logger.info('Client %s disconnected',socket.id)
			var time = (new Date).toLocaleTimeString();
			io.sockets.json.send({ 'event': 'userSplit', 'name': ID, 'time': time });
		});
		if (th.callbacks['connect'])
			th.callbacks['connect'](socket);
	});
	
	logger.stream({ start: -1 }).on('log', function(log) {
		    th.emit('log',{ 'event': 'log','src':'web_socket_'+name, 'data': log });
    });
	
	this.io=io;
}
util.inherits(module.exports, events.EventEmitter);