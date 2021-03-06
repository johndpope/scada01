strings = {
	'connected': '[sys][time]%time%[/time]: Вы успешно соединились к сервером как [user]%name%[/user].[/sys]',
	'userJoined': '[sys][time]%time%[/time]: Пользователь [user]%name%[/user] подключился.[/sys]',
	'messageSent': '[out][time]%time%[/time]: [user]%name%[/user]: %text%[/out]',
	'messageReceived': '[in][time]%time%[/time]: [user]%name%[/user]: %text%[/in]',
	'userSplit': '[sys][time]%time%[/time]: Пользователь [user]%name%[/user] отключился.[/sys]'
};
viewmodel = { dash: {} }
viewmodel.smodule = {};
viewmodel.currentdiv = 'dash';
window.onload = function () {
	navigate('dash');
	// Создаем соединение с сервером; websockets почему-то в Хроме не работают, используем xhr
	if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {

		//socket = io.connect(', { transports: ['websocket'] });
		socket = io('', { transports: ['websocket'] });

	} else {
		socket = io.connect('http://127.0.0.1:8080');
	}

	socket.on('connect', function () {
		$('.footer>.state').toggleClass('success');
		socket.off('message');
		socket.on('message', function (msg) {
			// Добавляем в лог сообщение, заменив время, имя и текст на полученные
			console.log(msg);

			if (functs[msg.event]) {
				functs[msg.event](msg);
				return;
			}
			dashlog('<span class="$1">' + JSON.stringify(msg.data) + '</span><br>');



			dashlog(strings[msg.event].replace(/\[([a-z]+)\]/g, '<span class="$1">')
				.replace(/\[\/[a-z]+\]/g, '</span>')
				.replace(/\%time\%/, msg.time)
				.replace(/\%name\%/, msg.name)
				.replace(/\%text\%/, unescape(msg.text)
					.replace('<', '&lt;')
					.replace('>', '&gt;')) + '<br>');

			// Прокручиваем лог в конец
			document.querySelector('#log').scrollTop = document.querySelector('#log').scrollHeight;
		});
		socket.on('event', function (msg) {
			console.log(msg);
		});
		// При нажатии <Enter> или кнопки отправляем текст
		socket.json.send({ event: 'get_modules' });
	});
	socket.on('disconnect', function () {
		$('.footer>.state').toggleClass('success');
	})
	//init button links
	$('*[navigation=true]').on('click', function (e) {
		$('li.active').removeClass('active');
		e.preventDefault();
		$(this.parentNode).addClass('active');
		var div = $(this).data('div');
		navigate(div);
	})




};
var functs = {}
functs.send_modules = function (msg) {
	smodule = {};
	$.each(msg.data, function (k, e) {
		var started = e.state == 0 ? "stoped" : 'started';
		e.started = e.state == 0 ? false : true;
		e.stoped = !e.started;
		expandElem(e, 'modules');

		//	viewmodel.smodule[e.id]=e;
	});
	viewmodel.smodule = msg.data;

}
function getbyid(arr, id) {
	for (var i = 0, len = arr.length; i < len; i++) {
		if (arr[i].id == id)
			return arr[i]; // Return as soon as the object is found
	}
	return null;
}

functs.modules_upd = function (msg) {
	var e = msg.data;
	var started = e.state == 0 ? "stoped" : 'started';
	expandElem(e, 'modules');

	for (var i = 0; i < viewmodel.smodule.length; i++) {
		if (viewmodel.smodule[i].id == e.id) {
			for (var a in e) 
				viewmodel.smodule[i][a] = e[a];
			viewmodel.smodule[i].started = e.state == 0 ? false : true;
			viewmodel.smodule[i].stoped = e.state == 0 ? true : false;
			return;
			
		}
	}
	var newm = e;

	newm.started = e.state == 0 ? false : true;
	newm.stoped = e.state == 0 ? true : false;

	viewmodel.smodule.push(newm);
}
functs.iec104 = function (msg) {

	dashlog('<span>' + JSON.stringify(msg) + '</span><br>');
}
functs.perfmon = function (msg) {
	var cpuObj = $('#cpuLoad').data('radialIndicator');
	var memObj = $('#ramLoad').data('radialIndicator');
	if (!cpuObj || !memObj)
		return;
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
functs.log = function (msg) {
	var str = '<span class="log_' + msg.data.level + ' ' + msg.src + '">' + msg.data.timestamp.replace('T', ' ').replace('Z', ' ') + '(<b>' + msg.src + '</b>): ' + msg.data.message + '</span><br>';
	$('.footer>.last_log').html(str);
	dashlog(str);
}



////////
function dashlog(msg) {
	var logwin = $('#log');
	logwin.append(msg);
	if (viewmodel.dash.logdata != '-')
		viewmodel.dash.logdata += msg;
	var mydiv = $("#log");
	mydiv.scrollTop(mydiv.prop("scrollHeight"));
}
function initIndicators() {
	$('#cpuLoad').radialIndicator({
		radius: 80,
		barWidth: 20,
		barBgColor:'#333',
		barColor: {

			0: '#33CC33',
			100: '#FF0000'
		},
		percentage: true
	});
	$('#ramLoad').radialIndicator({
		radius: 80,
		barWidth: 20,
		barBgColor:'#333',
		barColor: {

			0: '#33CC33',
			100: '#FF0000'
		},
		percentage: true
	});
}
function navigate(div) {
	if (_divPreFuncs[viewmodel.currentdiv])
		_divPreFuncs[viewmodel.currentdiv]();
	$.ajax('/div_' + div).done(function (d) {
		$('.main').html(d);
		if (_divfuncs[div])
			_divfuncs[div]();
		viewmodel.currentdiv = div;
	})
}




var _divfuncs = {};
_divfuncs.dash = function () {
	initIndicators();
	$('#log').html(viewmodel.dash.logdata);
	$('#commander').on('keyup', function (e) {
    if (e.keyCode == 13) {
        var cmd=$('#commander').val();
		$('#commander').val('');
		socket.json.send({ event: 'terminal',text:cmd});

    }
});
}
_divfuncs.modules = function () {

	var addm = function () {

		$.ajax('/modules/new', {
			method: 'post', data: {
				name: $('#module-name').val(),
				desc: $('#module-desc').val(),
				path: $('#module-path').val(),
				args: $('#module-args').val()
			}
		}).done((d) => {
			$('.add-module-mod').modal('hide');
		});
	}
	$.get('/divmodals_addmodule', function (a) {
		$('.main').append(a);
		$('#addmodbut').on('click', addm);

	});

	$('#showaddmbut').off('click');

	//rivets.unbind($('#tmodules'))
	$('#showaddmbut').on('click', () => { $('.add-module-mod').modal('show'); });

	viewmodel.binds = rivets.bind($('#tmodules'), { model: viewmodel })
}
_divfuncs.logs = function () {
	$.ajax('/getlogslist', { dataType: 'json' }).done(function (d) {
		var loges = { data: d };
		rivets.bind($('#logbtn'), { loges: loges });
		setTimeout(() => {
			$('.logbtn.btn-default').on('click', (s) => {
				$.ajax('getlogs', { method: 'post', dataType: 'json', data: { file: $(s.target).html() } }).done(
					(d) => {
						$('.mlog').html('');
						$.each(d.file, function (k, e) {
							var line = '<b>' + e.timestamp.replace(new RegExp(/[T,Z]/, 'g'), ' ') + '</b>:' + e.message;
							$('.mlog').prepend('<span>' + line + '</span><br>');
						})
					}
				)

			});
		}, 200);
		$('.logbtn.btn-success').on('click', () => {
			var link = document.createElement('a');
			link.setAttribute('href', 'download_all_logs');
			link.setAttribute('download', 'download');
			onload = link.click();

		})

	}

	);

}

var _divPreFuncs = {};
_divPreFuncs.dash = function () {
	viewmodel.dash.logdata = $('#log').html();
}
var testdata = [];
function benchmark() {
	$.ajax('/bench').done(function (d) {
		var dt = new Date();
		testdata = JSON.parse(d);
		var dt2 = new Date();
		console.log(dt, dt2);
	}).fail(function (f) {
		alert(f);
	});
}

function expandElem(el, type) {
	var ext = obj_exts[type];
	if (ext) {
		for (property in ext) {
			el[property] = ext[property];
		}
	}
}
var obj_exts = {
	modules:
	{
		startstop: function () {
			$.ajax('/modules/startstop', { method: 'post', data: { id: $(this).parent().data('id') } });

		},
		edit: function () {
			var mdl = getbyid(viewmodel.smodule, $(this).parent().data('id'))
			var addm = function () {
				var modal=$('.edit-module-mod');
				$.ajax('/modules/edit', {
					method: 'post', data: {
						id: mdl.id,
						name: modal.find('#module-name').val(),
						desc: modal.find('#module-desc').val(),
						path: modal.find('#module-path').val(),
						args: modal.find('#module-args').val()
					}
				}).done((d) => {
					$('.edit-module-mod').modal('hide')
				});
			}
			$.get('/divmodals_editmodule', function (a) {
				
				$('.main').append(a);
				var modal=$('.edit-module-mod');
				modal.find('#module-name').val(mdl.name)
				modal.find('#module-desc').val(mdl.desc)
				modal.find('#module-path').val(mdl.path)
				modal.find('#module-args').val(mdl.args.str)
				modal.find('#editmodbut').on('click', addm);
				$('.edit-module-mod').modal('show');
				$('.edit-module-mod').on('hidden.bs.modal',()=>{$('.edit-module-mod').remove()})

			});

		},
		delete: function () {
			$.ajax('/modules/delete', { method: 'post', data: { id: $(this).parent().data('id') } });
		},
	}
};