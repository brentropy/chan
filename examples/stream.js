// jshint esnext:true
'use strict';

var fs    = require('fs')
  , chan  = require('../chan')
  , co    = require('co')
  , split = require('split');

co(function *() {
  var ch = chan(String);

  fs.createReadStream(__dirname + '/../README.markdown')
    .pipe(split())
    .on('data',  ch)
    .on('end',   ch.close);

  while (!ch.done()) {
    console.log('Stream yielded: ' + String(yield ch));
  }

  console.log('Stream ended');
})();

