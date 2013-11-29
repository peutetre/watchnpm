var port = process.env.PORT || 8001;
var fs = require('fs');
var util = require('util');
var oauth = require('oauth');
var db = require('./db');

var config = JSON.parse(fs.readFileSync(process.env.WATCHNPM_CONFIG ? process.env.WATCHNPM_CONFIG : "./watchnpm_config.json"));

function consumer() {
  return new oauth.OAuth(
    "https://twitter.com/oauth/request_token",
    "https://twitter.com/oauth/access_token", 
    config.twitterBackConsumerKey, config.twitterBackConsumerSecret,
    "1.0A",
    config.twitterCallback,
    "HMAC-SHA1"
  );
}

var client = consumer();

/*
client.get("https://api.twitter.com/1.1/account/verify_credentials.json",
  config.twitterBackAccessToken, config.twitterBackAccessTokenSecret,
  function (error, data, response) {
        if (error) {
          console.log("Error getting twitter screen name : " + util.inspect(error), 500);
        } else {
            console.log(data);
        }
  }
);
*/

function _sendTweet(tweet, cb) {
    client.post("https://api.twitter.com/1.1/statuses/update.json", config.twitterBackAccessToken, config.twitterBackAccessTokenSecret, tweet, function(error, data, response) {
        if (error) {
            // console.log("Error posting : " + util.inspect(error), 500);
            cb && cb(error);
        } else {
            // console.log(data);
            cb && cb(null, data);
        }
    });
}

var tweet = exports.tweet = function(user, package, cb) {
    // console.log(package);
    var st = util.format("@%s %s(%s) %s", user, package.name, package['dist-tags']['latest'], package.description)
    if(st.length > 140){
        st = st.substr(0, 137) + '...'
    }
    var tweet = {
        status: st
    };
    _sendTweet(tweet, cb);
    // console.log(tweet); cb & cb(null, tweet)
}

var notifyAll = exports.notifyAll = function(package) {
    var latest = package['dist-tags']['latest'];
    db.notify(package.name, latest, function(err, results) {
        results.forEach(function(u, i){
            tweet(u.user, package, function(err, data){
                if(err) {
                    console.error("CANNOT notify "+u.user)
                } else {
                    // Save in DB with the latest version notified to the user
                    db.notified(u.user, package.name, latest)
                }
            });
        });
    });
}
