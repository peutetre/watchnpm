var sqlite3 = require('sqlite3');

var db = exports.db = new sqlite3.Database('./db/watchnpm.db');

// INIT
exports.prepare = function(cb) {
    db.serialize(function() {
        // db.run("CREATE TABLE IF NOT EXISTS users  (user TEXT PRIMARY KEY ON CONFLICT REPLACE, data TEXT);");
        db.run("CREATE TABLE IF NOT EXISTS watches  (user TEXT, package TEXT, latest TEXT, PRIMARY KEY (user, package) ON CONFLICT REPLACE);");
        // db.run("CREATE TABLE IF NOT EXISTS metadata  (key TEXT primary key, value TEXT);");
        // db.run("INSERT OR IGNORE INTO metadata    VALUES ('lastUpdate', 0);");
        cb && cb(null, db);
    });
}

/*
exports.saveUser = function(user, data, cb) {
    db.run("INSERT INTO users (user, data) VALUES (?,?);", [user, data], function(err, results) {
        cb && cb(err, results);
    });
};
           
exports.getUser = function(user, cb) {
    db.get("SELECT data FROM users WHERE user = ?;", [user], function(err, results) {
        cb && cb(err, results);
    });
};

exports.users = function(cb) {
    db.all("SELECT user FROM users;", function(err, results) {
        cb && cb(err, results);
    });
};
*/

exports.watch = function(user, package, latest, cb) {
    db.run("INSERT OR REPLACE INTO watches (user, package, latest) VALUES (?,?,?);", [user, package, latest], function(err, results) {
        cb && cb(err, results);
    });
};

exports.unwatch = function(user, package, cb) {
    db.run("DELETE FROM watches WHERE user = ? AND package = ? ;", [user, package], function(err, results) {
        cb && cb(err, results);
    });
};

exports.watches = function(user, cb) {
    db.all("SELECT package,latest FROM watches WHERE user = ? ;", [user], function(err, results){
        cb && cb(err, results);
    });
};

// GET all users users to notify
exports.notify = function (package, latest, cb) {
    db.all("SELECT user,latest FROM watches WHERE package = ? AND latest != ? ;", [package, latest], function(err, results){
        cb && cb(err, results);
    });
};

// SET each watch
exports.notified = function (user, package, latest, cb) {
    db.run("UPDATE watches SET latest = ? WHERE user = ? AND package = ? ;", [latest, user, package], function(err, results){
        cb && cb(err, results);
    });
};

exports.notifiedAll = function(package, latest, cb) {
    db.run("UPDATE watches SET latest = ? WHERE package = ? ;", [package], function(err, results){
        cb && cb(err, results);
    });
};
