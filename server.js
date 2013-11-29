var port = process.env.PORT || 8001;
var fs = require('fs');
var util = require('util');
var sys = require('sys');
var db = require('./db');
var search = require('./search');
var express = require('express');
var oauth = require('oauth');
var watcher = require('./watcher');

var config = JSON.parse(fs.readFileSync(process.env.WATCHNPM_CONFIG ? process.env.WATCHNPM_CONFIG : "./watchnpm_config.json"));
db.prepare();

var app = express();

// serving landing page
app.use(express.static(__dirname + '/landing'));
// serving app
app.use('/app', express.static(__dirname + '/public'));
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.session({secret: config.sessionSecret}));
app.use(express.bodyParser());



app.get('/api/search', function(req, res) {
    var q = req.param('q');
    search(q.split(/\s+/), function(err, results) {
        if(err){ res.send(500, 'ERR: '+err) } else { res.send(results) }
    })
});

app.post('/api/:user/watch', function(req, res) {
    db.watch(req.param('user'), req.param('package'), req.param('latest'), function(err, results) {
        // console.log(util.format("WATCH OK (%s,%s,%s)", req.param('user'), req.param('package'), req.param('latest')));
        res.send('OK');
    });
});

app.post('/api/:user/unwatch', function(req, res) {
    db.unwatch(req.param('user'), req.param('package'), function(err, results) {
        // console.log(util.format("UNWATCH OK (%s,%s)", req.param('user'), req.param('package')));
        res.send('OK');
    });
});

app.get('/api/:user/watches', function(req, res) {
  db.watches(req.param('user'), function(err, results){
      res.send(results);
  });
});

/* REPLACED by /oauth/credentials

app.get('/api/:user', function(req, res) {
    db.getUser(req.param('user'), function (err, results){
        // console.log(util.format('GET USER %s : %s,%s', req.param('user'), err, results)); 
        if(err){ res.send(500, 'ERR: '+err) } else { res.send(results.data) }
    });
});

app.post('/api/:user', function(req, res) {
    var u = JSON.stringify(req.body);
    db.saveUser(req.param('user'), u , function (err, results){
        // console.log(util.format("USER SAVE %s : %s", req.param('user'), err));
        if(err){ res.send(500, 'ERR: '+err) } else { res.send('OK') }
    });
});
*/

function consumer() {
  return new oauth.OAuth(
    "https://twitter.com/oauth/request_token",
    "https://twitter.com/oauth/access_token", 
    config.twitterConsumerKey, config.twitterConsumerSecret,
    "1.0A",
    config.twitterCallback,
    "HMAC-SHA1"
  );
}

app.use(function(req, res){
  res.locals = req.session;
});

app.get('/oauth/connect', function(req, res){
  consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
      res.send(500, "Error getting OAuth request token : " + sys.inspect(error));
    } else {  
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      // res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);
      /* https://dev.twitter.com/docs/api/1/get/oauth/authenticate
       This method differs from GET oauth/authorize in that if the user has already granted the application permission, the redirect will occur without the user having to re-approve the application. To realize this behavior, you must enable the Use Sign in with Twitter setting on your application record.
      */
      res.redirect("https://twitter.com/oauth/authenticate?oauth_token="+req.session.oauthRequestToken);
    }
  });
});

app.get('/oauth/callback', function(req, res){
  consumer().getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error) {
      res.send("Error getting OAuth access token : " + sys.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+sys.inspect(results)+"]", 500);
    } else {
      req.session.oauthAccessToken = oauthAccessToken;
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
      // Right here is where we would write out some nice user stuff
      consumer().get("https://api.twitter.com/1.1/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
        if (error) {
          res.send("Error getting twitter screen name : " + sys.inspect(error), 500);
        } else {
          req.session.twitterData = JSON.parse(data);
          req.session.twitterScreenName = req.session.twitterData.screen_name;
          // console.log(util.format("LOGGED IN %s, redirecting", req.session.twitterScreenName));
          res.redirect('/debug/session');
          // res.send('You are signed in: ' + req.session.twitterScreenName)
        }
      });  
    }
  });
});

app.get('/oauth/credentials', function(req, res) {
    if(req.session.twitterData)
        res.send(req.session.twitterData)
    else
        res.send(401, "User not logged-in");
})

app.get('/debug/session', function(req, res) {
    if(! req.session.debuga ) req.session.debuga = [] 
    req.session.debuga.push("TEST " + Date.now())
    res.send(req.session)
});

app.listen(port);
console.log('SERVER ready on port ' + port);
watcher.init();