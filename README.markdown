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
