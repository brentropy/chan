// jshint esnext:true

var chan = require('..')
var co   = require('co')
var ch   = chan(5)

co(function *() {
  var n
  while (!ch.done()) {
    yield chan.timeout(100)
    console.log('<-- ' + (yield ch))
  }
})


co(function *() {
  var n = 10
  while (n-- > 0) {
    yield ch(n)
    console.log(n + ' -->')
  }
  ch.close()
})
