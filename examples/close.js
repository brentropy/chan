// jshint esnext:true
'use strict';

var chan = require('../chan')
  , co   = require('co')
  , wait = require('co-wait')
  , ch   = chan();

co(function *() {
  var val;
  while (!ch.done()) {
    val = yield ch;
    if (val !== ch.empty) {
      console.log(val);
    }
  }
  console.log('Done!');
})();

co(function *() {
  var n = 10;
  
  while (n-- > 0) {
    yield wait(100);
    try {
      ch(n);
    } catch(err) {
      console.log(err.message);
    }

    if (n === 5) {
      ch.close();
    }
  }
})();
