var port = process.env.PORT || 8001;
var util = require('util');
var db = require('./db');
var search = require('./search');
var express = require('express');

db.prepare();

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.logger());
app.use(express.bodyParser());

app.get('/api/search', function(req, res) {
    var q = req.param('q');
    search(q.split(/\s+/), function(err, results) {
        if(err){ res.send(500, 'ERR: '+err) } else { res.send(results) }
    })
});

app.post('/api/:email/watch', function(req, res) {
    db.watch(req.param('email'), req.param('package'), req.param('latest'), function(err, results) {
        // console.log(util.format("WATCH OK (%s,%s,%s)", req.param('email'), req.param('package'), req.param('latest')));
        res.send('OK');
    });
});

app.post('/api/:email/unwatch', function(req, res) {
    db.unwatch(req.param('email'), req.param('package'), function(err, results) {
        // console.log(util.format("UNWATCH OK (%s,%s)", req.param('email'), req.param('package')));
        res.send('OK');
    });
});

app.get('/api/:email/watches', function(req, res) {
  db.watches(req.param('email'), function(err, results){
      res.send(results);
  });
});

app.get('/api/:email', function(req, res) {
    db.getUser(req.param('email'), function (err, results){
        // console.log(util.format('GET USER %s : %s,%s', req.param('email'), err, results)); 
        if(err){ res.send(500, 'ERR: '+err) } else { res.send(results.data) }
    });
});

app.post('/api/:email', function(req, res) {
    var u = JSON.stringify(req.body);
    db.saveUser(req.param('email'), u , function (err, results){
        // console.log(util.format("USER SAVE %s : %s", req.param('email'), err));
        if(err){ res.send(500, 'ERR: '+err) } else { res.send('OK') }
    });
});

app.listen(port);
console.log('SERVER ready on port ' + port);
