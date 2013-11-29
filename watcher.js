var couchwatch = require('couchwatch');
// var events = require('events');
var notifier = require('./notifier');

exports.init = function() {

    // var registry = new events.EventEmitter();
    var watcher = couchwatch('http://isaacs.iriscouch.com/registry', -1); // 810701
    
    watcher.on('row', function (change) {
        if(change.doc._deleted || !change.doc['dist-tags']['latest']) return;
    
        // registry.emit('change', change);
        // console.log("CHANGE "+change.seq);
        // console.log(change);
        notifier.notifyAll(change.doc);
    });
    
    watcher.on('error', function (er) {
         // Downgrade the error event from an EXIT THE PROGRAM to a warn log
         console.warn('couchwatch er', er);
    
         // Try again in a bit
         setTimeout(function () {
              watcher.init();
         }, 30 * 1000);
    });

    console.log('Couchwatch notifier started');
}

// exports.init();
