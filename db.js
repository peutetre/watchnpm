var Q = require('q'),
    MongoClient = require('mongodb').MongoClient,
    Config = require('./config.json');

var defer = Q.defer();

MongoClient.connect(process.env.MONGO_URL || Config.mongo, function(err, db) {
    if(err) return defer.reject(err);
    return defer.resolve(db);
});

module.exports = defer.promise;
