var DB = require('../db'),
    emailMatcher = /.+\@.+\..+/;

function isEmail(str) { return emailMatcher.test(str); }

function addEmailƒ(req, res) {
    return function addEmail(db) {
        var t = new Date(),
            collection = db.collection('people'),
            o = {
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
        res.status(500).render('error.html', { title:'500', msg: "Oops" });
    };
}

module.exports = function(req, res) {
    if(isEmail(req.param('email')))
        DB.then(addEmailƒ(req, res), logErrorƒ(req, res));
    else
        res.status(400).render('error.html', { title:null, msg: "Oops, `" + req.param('email') + "` doesn't look like a email!" });
};
