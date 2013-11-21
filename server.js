var port = process.env.PORT || 8001;
var http = require('http');
var server = http.createServer(function (request, response) {
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end("watchnpm...\n");
     });

server.listen(port);
