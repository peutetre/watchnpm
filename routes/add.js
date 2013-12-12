var MongoClient = require('mongodb').MongoClient;

module.exports = function(req, res){
    var t = new Date();
    MongoClient.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/landing-test', function(err, db) {
        if(err) throw err;

        var collection = db.collection('people');

        var o = {
            email:req.param('email'),
            t:t.getTime(),
            d:t,
            ip:req.ip
        };
        console.log(o.email);
        collection.insert(o, function(err) {
            db.close();
            res.render('done.html');
        });
    });
};
