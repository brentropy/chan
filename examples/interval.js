// jshint esnext:true

var chan = require('..')
var co   = require('co')

co(function *() {
  var int = chan.interval(40)
  while (true) {
    console.log('a: ' + (yield int))
  }
})()

co(function *() {
  var int = chan.interval(30)
  while (true) {
    console.log('b: ' + (yield int))
  }
})()
