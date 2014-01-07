# Chan

A [go](http://golang.org) style channel implementation that works well with [co](https://github.com/visionmedia/co).

## Installation

```bash
$ npm install chan
```
## Usage

Chan does not directly use any ES6 Harmony features, but it is designed to work well with co, a control flow library based on ES6 generators. The following example uses co and requires `node 0.11.x` (unstable) and must be run with the `--harmony-generators` flag. Future stable versions of node.js will include support for generators.

```javascript
// require the dependencies
var chan = require('chan')
  , co   = require('co')
  , fs   = require('fs');

// make a new channel
var ch = chan();

// execute a co generator
co(function *() {
  
  // pass the channel as the callback to filesystem read file function
  // this will push the file contents in to the channel
  fs.readFile(__dirname + '/README.markdown', ch);

  // yield the channel to pull the value off the channel
  var contents = yield ch;

  // use the value
  console.log(String(contents));

})();
```

You can also wait for a message to be ready on multiple channels (the golang equivalent of the `select` statement:

``` javascript
var chan = require('chan')
  , co   = require('co');

// make two channels
var ch1 = chan()
  , ch2 = chan();

co(function *() {
  // will block until there is data on either ch1 or ch2,
  // and will return the channel with data
  // if data is on both channels, a channel will be selected at random
  switch (yield chan.select(ch1, ch2)) {
    
    // channel 1 received data
    case ch1:
      // retrieve the message yielded by the channel
      console.log(yield ch1.selected);
      break;

    // channel 2 received data
    case ch2:
      // retrieve the message yielded by the channel
      console.log(yield ch2.selected);
      break;
  }
})();

// put 42 onto channel 1
ch1(42);
```
