# Chan

A [golang](http://golang.org) like channel implementation for JavaScript that
works well with [co](https://github.com/visionmedia/co).

[![Build Status](https://travis-ci.org/brentburgoyne/chan.png)](https://travis-ci.org/brentburgoyne/chan)
[![Code Climate](https://codeclimate.com/github/brentburgoyne/chan.png)](https://codeclimate.com/github/brentburgoyne/chan)
[![Dependency Status](https://gemnasium.com/brentburgoyne/chan.png)](https://gemnasium.com/brentburgoyne/chan)

## Installation

```bash
$ npm install chan

```

## How does it work?

Chan is inspired by golang's channels. However, it is implemented as a function
that represents an asynchronus first in first out queue.

### Sending values to the channel

Chan supports adding values to the queue by calling the channel or by
using it directly as a callback for a node-style asynchronous function.

```javascript
var fs   = require('fs')
  , chan = require('chan')
  , ch   = chan();

// add any non-function value
ch('value');

// add an error
ch(new Error('this is an error'));

// add a value of any type
ch(null, 'value');

// used as a callabck
fs.readFile(__filename, ch);
```

### Receiving values from the channel

If you noticed in the previous example, a function cannot be added to the
channel by passing it as the first argument. This is because values are removed
by calling the channel with a callback as the first argument. This is a
standard node-style callback which receives an `Error` or `null` as the first
argument and the actual value second.

```javascript
ch(function(err, val) {
  if (err) {
    // handle error
  } else {
    // use value  
  }
});
```

Because the channel is a function and takes a callback with that signature as
the first argument, a channel is also a *thunk* and is a yieldable in
[co](https://github.com/visionmedia/co).

```javascript
var co   = require('co')
  , fs   = require('fs')
  , chan = require('chan')
  , ch   = chan();

co(function *() {
  // value received by yielding the channel within a co generator
  console.log(yield ch);
});

fs.readFile(__filename, ch);
```

## Usage

Chan does not directly use any ES6 Harmony features, but it is designed to work
well with co, a control flow library based on ES6 generators. The following
example uses co and requires `node 0.11.x` (unstable) and must be run with the
`--harmony-generators` flag. Future stable versions of node.js will include
support for generators.

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

You can also wait for a message to be ready on multiple channels (the golang
equivalent of the `select` statement:

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
