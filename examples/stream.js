// jshint esnext:true
'use strict';

var fs    = require('fs')
  , chan  = require('../chan')
  , co    = require('co')
  , split = require('split');

co(function *() {
  var ch = chan(new Buffer(0));

  fs.createReadStream(__dirname + '/../README.markdown')
    .pipe(split())
    .on('data',  ch)
    .on('error', ch)
    .on('end',   ch.close);

  while (!ch.done()) {
    try {
      console.log('Stream yielded: ' + String(yield ch));
    } catch(err) {
      console.log('Stream error:' + err.message);
    }
  }

  console.log('Stream ended');
})();

