// jshint esnext:true

var chan = require('..')
var co   = require('co')
var ch   = chan()

co(function *() {
  var n

  while ((n = yield ch)) {
    console.log(n)
  }
})()

co(function *() {
  var n = 50

  while (n-- > 0) {
    yield chan.timeout(100)
    ch(n)
  }
})()
