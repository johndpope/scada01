var clbks={};
module.exports.callbacks=clbks;
module.exports.start=function(http){
var wsserver =require('socket.io');
var io=wsserver(http);
///io.listen(1234); 

io.set('transports',['websocket']);
// Отключаем вывод полного лога - пригодится в production'е

// Навешиваем обработчик на подключение нового клиента
io.sockets.on('connection', function (socket) {
	// Т.к. чат простой - в качестве ников пока используем первые 5 символов от ID сокета
	var ID = (socket.id).toString().substr(0, 5);
	var time = (new Date).toLocaleTimeString();
	// Посылаем клиенту сообщение о том, что он успешно подключился и его имя
	socket.json.send({'event': 'connected', 'name': ID, 'time': time});
	// Посылаем всем остальным пользователям, что подключился новый клиент и его имя
	socket.broadcast.json.send({'event': 'userJoined', 'name': ID, 'time': time});
	// Навешиваем обработчик на входящее сообщение
	socket.on('message', function (msg) {
		var time = (new Date).toLocaleTimeString();
		// Уведомляем клиента, что его сообщение успешно дошло до сервера
		socket.json.send({'event': 'messageSent', 'name': ID, 'text': msg, 'time': time});
		// Отсылаем сообщение остальным участникам чата
		socket.broadcast.json.send({'event': 'messageReceived', 'name': ID, 'text': msg, 'time': time})
	});
	// При отключении клиента - уведомляем остальных
		socket.on('disconnect', function() {
		var time = (new Date).toLocaleTimeString();
		io.sockets.json.send({'event': 'userSplit', 'name': ID, 'time': time});
	});
	if(exports.callbacks['connect'])
		exports.callbacks['connect'](socket);
});
return io;
}