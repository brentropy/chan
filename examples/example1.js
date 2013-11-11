'use strict';

// require the dependencies
var chan = require('../chan')
  , co   = require('co')
  , fs   = require('fs');

// make a new channel
var ch = chan();

// execute a co generator
co(function *() {
  
  // pass the channel as the callback to filesystem read file function
  // this will push the file contents in to the channel
  fs.readFile(__dirname + '/../README.markdown', ch);

  // yield the channel to pull the value off the channel
  var contents = yield ch;

  // use the value
  console.log(String(contents));

})();
