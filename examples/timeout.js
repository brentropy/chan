// jshint esnext:true

var request = require('superagent')
var chan    = require('..')
var co      = require('co')

co(function *() {
  var ch = chan()
  request.get('http://google.com', ch)
  
  switch (yield chan.select(ch, chan.timeout(1000))) {
    case ch:
      console.log('Google loaded.')
      break
    default:
      console.log('Timeout of 1 second reached.')
  }
})()
