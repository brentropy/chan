// jshint esnext:true
'use strict';

var chan = require('../chan')
  , co   = require('co')
  , wait = require('co-wait')
  , ch   = chan();

co(function *() {
  while (!ch.done()) {
    console.log(yield ch);
  }
  console.log('Done!');
})();

co(function *() {
  var n = 50;
  
  while (n-- > 0) {
    yield wait(100);
    try {
      ch(n);
    } catch(err) {
      console.log(err.message);
    }

    if (n === 25) {
      ch.close();
    }
  }
})();
