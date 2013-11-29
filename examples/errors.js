// jshint esnext:true
'use strict';

var chan = require('../chan')
  , co   = require('co')
  , fs   = require('fs');

co(function *() {
  var ch = chan();
  
  fs.readFile('something', ch);

  try {
    yield ch;
  } catch (err) {
    console.log('failed: %s', err.message);
  }
})();
