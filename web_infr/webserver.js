
var url = require('url');
var fs = require('fs');
var functs = {};
functs.test = {
    name: 'test', body: function (q, res) {
        res.end('test func');
    }
}
var allowedtypes = { html: { mime: 'text/html' },
    css: { mime: 'text/css' },
    js: { mime: 'application/javascript' },
    png: { mime: 'image/png' },
    json: { mime: 'application/json' },
    ttf: { mime: 'image/tiff' },
    woff: { mime: 'text/html' },
    woff2: { mime: 'text/html' },
    mp3: { mime: 'audio/mpeg' },
    map:{ mime: 'text/css' }};
function processRequest(req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var rfunc = query['f'];
    var dotpos = url_parts.pathname.lastIndexOf('.');
    if (dotpos != -1) {
        var typ = allowedtypes[url_parts.pathname.substring(dotpos + 1)];
        if (typ) {

            fs.readFile('./www' + url_parts.pathname, function (error, content) {
                if (error) {
                    res.writeHead(500);
                    res.end();
                    return;
                }
                else {
                    res.writeHead(200, { 'Content-Type': typ.mime });
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