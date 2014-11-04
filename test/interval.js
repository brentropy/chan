/* jshint expr:true */
/* global describe:true, beforeEach:true, afterEach:true, it:true */

var interval = require('../lib/interval')
var should  = require('should')
var sinon   = require('sinon')

describe('Interval channel make', function () {
  
  it('should return a function', function () {
    var int = interval(500)
    int.should.be.a.Function
  })

  it('should should call the callback after a number of ms', function () {
    var clock = sinon.useFakeTimers()
    var cb    = sinon.spy()
    var ms    = 500
    var int   = interval(ms)
    int(cb)
    clock.tick(ms - 1)
    cb.called.should.be.false
    clock.tick(1)
    cb.called.should.be.true
  })

  it('should call the callback after number of ms', function () {
    var clock = sinon.useFakeTimers()
    var cb    = sinon.spy()
    var ms    = 500
    var int   = interval(ms)
    int(cb)
    clock.tick(ms - 1)
    cb.called.should.be.false
    clock.tick(1)
    cb.called.should.be.true
  })

})

