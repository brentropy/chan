'use strict';

// require the dependencies
var chan = require('../chan')
  , co   = require('co');

// make a new channel
var ch = chan();

// execute a co generator
co(function *() {
  
  // infinite loop
  while (true) {
    // pull the next value off the channel
    console.log(yield ch);
  }

})();

// set a varibale to increment
var i = 0;

// put a number on the channel every 100 milliseconds
setInterval(function() { ch(++i); }, 100);
