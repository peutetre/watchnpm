var sqlite3 = require('sqlite3');

var db = exports.db = new sqlite3.Database('./db/watchnpm.db');

// INIT
exports.prepare = function(cb) {
    db.serialize(function() {
        db.run("CREATE TABLE IF NOT EXISTS users  (email TEXT PRIMARY KEY ON CONFLICT REPLACE, data TEXT);");
        db.run("CREATE TABLE IF NOT EXISTS watches  (email TEXT, package TEXT, latest TEXT, PRIMARY KEY (email, package) ON CONFLICT REPLACE);");
        // db.run("CREATE TABLE IF NOT EXISTS metadata  (key TEXT primary key, value TEXT);");
        // db.run("INSERT OR IGNORE INTO metadata    VALUES ('lastUpdate', 0);");
        cb && cb(null, db);
    });
}

exports.saveUser = function(email, data, cb) {
    db.run("INSERT INTO users (email, data) VALUES (?,?);", [email, data], function(err, results) {
        cb && cb(err, results);
    });
};
           
exports.getUser = function(email, cb) {
    db.get("SELECT data FROM users WHERE email = ?;", [email], function(err, results) {
        cb && cb(err, results);
    });
};

exports.users = function(cb) {
    db.all("SELECT email FROM users;", function(err, results) {
        cb && cb(err, results);
    });
};

exports.watch = function(email, package, latest, cb) {
    db.run("INSERT OR REPLACE INTO watches (email, package, latest) VALUES (?,?,?);", [email, package, latest], function(err, results) {
        cb && cb(err, results);
    });
};

exports.unwatch = function(email, package, cb) {
    db.run("DELETE FROM watches WHERE email = ? AND package = ? ;", [email, package], function(err, results) {
        cb && cb(err, results);
    });
};

exports.watches = function(email, cb) {
    db.all("SELECT package,latest FROM watches WHERE email = ? ;", [email], function(err, results){
        cb && cb(err, results);
    });
};

// GET all users emails to notify
exports.notify = function (package, latest, cb) {
    db.all("SELECT email,latest FROM watches WHERE package = ? AND latest != ? ;", [package, latest], function(err, results){
        cb && cb(err, results);
    });
};

// SET each watch
exports.notified = function (email, package, latest, cb) {
    db.run("UPDATE watches SET latest = ? WHERE email = ? AND package = ? ;", [latest, email, package], function(err, results){
        cb && cb(err, results);
    });
};

exports.notifiedAll = function(package, latest, cb) {
    db.run("UPDATE watches SET latest = ? WHERE package = ? ;", [package], function(err, results){
        cb && cb(err, results);
    });
};
