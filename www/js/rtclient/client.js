strings = {
	'connected': '[sys][time]%time%[/time]: Вы успешно соединились к сервером как [user]%name%[/user].[/sys]',
	'userJoined': '[sys][time]%time%[/time]: Пользователь [user]%name%[/user] присоединился к чату.[/sys]',
	'messageSent': '[out][time]%time%[/time]: [user]%name%[/user]: %text%[/out]',
	'messageReceived': '[in][time]%time%[/time]: [user]%name%[/user]: %text%[/in]',
	'userSplit': '[sys][time]%time%[/time]: Пользователь [user]%name%[/user] покинул чат.[/sys]'
};
window.onload = function () {
	initIndicators();
	// Создаем соединение с сервером; websockets почему-то в Хроме не работают, используем xhr
	if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
		socket = io.connect('http://127.0.0.1:1234', { transports: ['websocket'] });
	} else {
		socket = io.connect('http://127.0.0.1:8080');
	}
	socket.on('connect', function () {
		socket.on('message', function (msg) {
			// Добавляем в лог сообщение, заменив время, имя и текст на полученные
			console.log(msg);
			if (functs[msg.event]) {
				functs[msg.event](msg);
				return;
			}


			document.querySelector('#log').innerHTML += strings[msg.event].replace(/\[([a-z]+)\]/g, '<span class="$1">').replace(/\[\/[a-z]+\]/g, '</span>').replace(/\%time\%/, msg.time).replace(/\%name\%/, msg.name).replace(/\%text\%/, unescape(msg.text).replace('<', '&lt;').replace('>', '&gt;')) + '<br>';
			// Прокручиваем лог в конец
			document.querySelector('#log').scrollTop = document.querySelector('#log').scrollHeight;
		});
		socket.on('event', function (msg) {
			console.log(msg);
		});
		// При нажатии <Enter> или кнопки отправляем текст
		document.querySelector('#input').onkeypress = function (e) {
			if (e.which == '13') {
				// Отправляем содержимое input'а, закодированное в escape-последовательность
				socket.send(escape(document.querySelector('#input').value));
				// Очищаем input
				document.querySelector('#input').value = '';
			}
		};
		document.querySelector('#send').onclick = function () {
			socket.send(escape(document.querySelector('#input').value));
			document.querySelector('#input').value = '';
		};
	});




};
var functs = {}
functs.modules = function (msg) {
	$.each(msg.data, function (k, e) {
		var started=e.state==0?"stoped":'started';
		document.querySelector('#log').innerHTML += 'Module:'+e.name+' Path:'+e.path+' '+started+ '<br>';
	});

}
functs.modules_upd = function (msg) {
var e=msg.data;
		var started=e.state==0?"stoped":'started';
		document.querySelector('#log').innerHTML += 'Module:'+e.name+' Path:'+e.path+' '+started+ '<br>';


}
functs.perfmon = function (msg) {
	var cpuObj = $('#cpuLoad').data('radialIndicator');
	var memObj = $('#ramLoad').data('radialIndicator');
	var totalmem = 0;
	for (var i = 0; i < msg.tmem.length; i++) {
		totalmem = totalmem + msg.tmem[i];
	}
	totalmem = totalmem / 1024 / 1024;
	var user = totalmem - msg.data.counters['\\Память\\Доступно МБ']
	var memperc = user / (totalmem / 100);
	cpuObj.animate(msg.data.counters['\\238(_total)\\6']);
	memObj.animate(memperc);
}
function initIndicators() {
	$('#cpuLoad').radialIndicator({
		radius: 80,
		barWidth: 20,
		barColor: {

			0: '#33CC33',
			33: '#0066FF',
			66: '#FFFF00',
			100: '#FF0000'
		},
		percentage: true
	});
	$('#ramLoad').radialIndicator({
		radius: 80,
		barWidth: 20,
		barColor: {

			0: '#33CC33',
			33: '#0066FF',
			66: '#FFFF00',
			100: '#FF0000'
		},
		percentage: true
	});
}