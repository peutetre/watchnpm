var mongodb = require('mongodb');
var events = require('events');
var Q = require('q');
var event = new events.EventEmitter();
var access = new mongodb.Server('127.0.0.1', 27017, { });
var defer = Q.defer();

new mongodb.Db('landing-test', access, { safe: true, auto_reconnect: true }).open(function (err, c) {
  if (!err) {
    defer.resolve(c);
  } else {
    defer.reject(err);
  }
});

module.exports = defer.promise;
