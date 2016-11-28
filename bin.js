const addon = require('./binmodules/build/Release/addon');

addon.doTask(function(s)
{console.log(s);
}); // 'world'