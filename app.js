var express = require('express');
var http = require('http');
var path = require('path');
var engines = require('consolidate');

var onIndex = require('./routes');
var onAdd = require('./routes/add');

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', engines.ejs);
app.set('view engine', 'html');

app.use(express.favicon());
app.use(express.logger('dev'));
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

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
