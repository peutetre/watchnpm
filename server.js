var server = require('node-router').getServer();

server.get("/", function (request, response) {
    response.simpleText(200, "watchnpm...");
});

server.listen(80);
