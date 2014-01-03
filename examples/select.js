// require the dependencies
var chan = require('../chan')
  , co   = require('co');

// make two channels
var ch1 = chan()
  , ch2 = chan();

co(function *() {
  // will block until there is data on either ch1 or ch2,
  // and will return the channel with data
  // if data is on both channels, a channel will be selected at random
  var first = yield chan.select([ch1, ch2]);
  switch (first) {
    // channel 1 received data
    case ch1:
      // retrieve the message from the channel
      var val1 = yield ch1;
      console.log(val1);
      break;

    // channel 1 received data
    case ch2:
      // retrieve the message from the channel
      var val2 = yield ch2;
      console.log(val2);
      break;
  }
})();

// put 42 onto channel 1
ch1(42);
