var FS = require("q-io/fs");

module.exports = function(req, res){
  var t = new Date();
  FS.append('./data/emails.txt', req.param('email') + ', ' + t + ', ' + t.getTime() + ', ' + req.ip);
  res.render('done.html');
};
