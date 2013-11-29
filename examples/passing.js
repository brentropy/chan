// jshint esnext:true
'use strict';

var chan = require('../chan')
  , co   = require('co')
  , wait = require('co-wait')
  , ch   = chan();

co(function *() {
  var n;
  
  while ((n = yield ch)) {
    console.log(n);
  }
})();

co(function *() {
  var n = 50;
  
  while (n-- > 0) {
    yield wait(100);
    ch(n);
  }
})();
