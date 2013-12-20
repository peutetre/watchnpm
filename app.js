var express = require('express');
var http = require('http');
var path = require('path');
var engines = require('consolidate');

var loggerƒ = require('./logger');
var onIndex = require('./routes');
var onAdd = require('./routes/add');

var app = express(),
    port =  process.env.PORT || 3000;

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', engines.ejs);
app.set('view engine', 'html');

app.use(express.favicon());
app.use(express.logger(loggerƒ));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon(path.join(__dirname, 'public/images/favicon.ico')));

app.use(function(req, res) {
  res.status(400).render('error.html', { title:null, msg: '404' });
});

app.use(function(error, req, res, next) {
  res.status(500).render('error.html', { title:'500', msg: error });
});

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', onIndex);
app.post('/', onAdd);

function init() {
    var server = http.createServer(app).listen(port, function(){
        console.log('Express server listening on port ' + port);
    });

    server.on('error', function (err) {
        if(err.code == 'EADDRINUSE') {
            console.log('port ' + port + ' is already in use...');
            console.log('trying port' + (port + 1) );
            port = port + 1;
            init();
        }
        else {
            console.log(err);
        }
    });
}

init();
