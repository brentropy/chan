/* jshint expr:true */
/* global describe:true, beforeEach:true, afterEach:true, it:true */

var timeout = require('../lib/timeout')
var should  = require('should')
var sinon   = require('sinon')

describe('Timeout channel make', function () {
  
  it('should return a function', function () {
    var to = timeout(500)
    to.should.be.a.Function
  })

  it('should should call the callback after a number of ms', function () {
    var clock = sinon.useFakeTimers()
    var cb    = sinon.spy()
    var ms    = 500
    var to    = timeout(ms)
    to(cb)
    clock.tick(ms - 1)
    cb.called.should.be.false
    clock.tick(1)
    cb.called.should.be.true
  })

})
