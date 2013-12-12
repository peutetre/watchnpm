var DB = require('../db');

function addEmailƒ(req, res) {
    return function addEmail(db) {
        var t = new Date();
        var collection = db.collection('people');
        var o = {
            email:req.param('email'),
            t:t.getTime(),
            d:t,
            ip:req.ip
        };

        console.log("\nNEW mail !!!!! " + o.email + '\n');

        collection.insert(o, function(err) {
            res.render('done.html');
        });
    };
}

function logErrorƒ(req, res) {
    return function logError(err) {
        console.log("\n[" + (new Date()).toLocaleString() + "] DB ERROR in routes/add: " + err + '\n');
        res.render('500.html', {title:'500', error: "Oops"})
    };
}

module.exports = function(req, res) {
    DB.then(addEmailƒ(req, res), logErrorƒ(req, res));
};
