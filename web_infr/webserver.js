
var url = require('url');
var fs = require('fs');
var functs = {};
functs.test = {
    name: 'test', body: function (q, res) {
        res.end('test func');
    }
}
var allowedtypes = ['html', 'css', 'js', 'png','json','ttf','woff','woff2','mp3'];
function processRequest(req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var rfunc = query['f'];
    var dotpos = url_parts.pathname.lastIndexOf('.');
    if (dotpos != -1) {
        var typ = url_parts.pathname.substring(dotpos + 1);
        if (allowedtypes.indexOf(typ) != -1) {
            
            fs.readFile('./www' + url_parts.pathname, function (error, content) {
                if (error) {
                    res.writeHead(500);
                    res.end();
                    return;
                }
                else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                    return;
                }
            });
            return;
        }
        else
            console.log(url_parts.pathname);


    }
    if (rfunc) {
        var fun = functs[rfunc];
        if (fun) {
            fun.body(query, res);
            return;
        }
        else {
            res.end('Unknown request');
            return;
        }

    }

    console.log(query);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
}

module.exports.processRequest = processRequest;