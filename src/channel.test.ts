import {equal, ok} from 'assert'
import * as sinon from 'sinon'
import {describe, it, beforeEach, afterEach} from 'mocha'
import {Channel} from './channel'
import {BufferBlocking} from './buffer'
import * as Deferred from './deferred'

describe('Channel', () => {
  let buffer
  let ch
  let deferred
  let deferredStub

  beforeEach(() => {
    deferred = new Deferred.Deferred()
    buffer = new BufferBlocking(5)
    deferredStub = sinon.stub(Deferred, 'Deferred').returns(deferred)
    ch = new Channel(buffer)
  })

  afterEach(() => {
    deferredStub.restore()
  })

  describe('take', () => {
    it('returns deferred promise', () => {
      equal(ch.take(), deferred.promise)
    })

    it('resolves with the first value in the buffer', async () => {
      const val = {}
      ch.put(val)
      ch.put({})
      equal(await ch.take(), val)
    })

    it('resolves when a value is added after the take', async () => {
      const val = {}
      setImmediate(() => ch.put(val))
      equal(await ch.take(), val)
    })

    it('rejects when called on a closed channel', async () => {
      ch.close()
      let err
      try {
        await ch.take()
      } catch (e) {
        err = e
      }
      ok(err)
    })
  })

  describe('then', () => {
    it('proxies call to then of promise returned by take', () => {
      const ret = {}
      const then = sinon.stub().returns(ret)
      sinon.stub(ch, 'take').returns({then})
      const onFullfilled = {}
      const onRejected = {}
      equal(ch.then(onFullfilled, onRejected), ret)
      sinon.assert.calledWithExactly(then, onFullfilled, onRejected)
    })
  })

  describe('cancelableTake', () => {
    it('returns a promise and a cancel function', () => {
      const [promise, cancel] = ch.cancelableTake()
      ok(promise instanceof Promise)
      equal(typeof cancel, 'function')
    })

    it('promise comes from call to take', () => {
      const expected = {}
      sinon.stub(ch, 'take').returns(expected)
      const [promise] = ch.cancelableTake()
      equal(promise, expected)
    })

    it('cancel function removes pending take', async () => {
      deferredStub.restore()
      const [first, cancel] = ch.cancelableTake()
      first.catch(() => null)
      const second = ch.take()
      cancel()
      const val = {}
      ch.put(val)
      equal(await second, val)
    })

    it('promise for pending take is rejected', async () => {
      let rejectedErr
      const [promise, cancel] = ch.cancelableTake()
      cancel()
      try {
        await promise
      } catch (err) {
        rejectedErr = err
      }
      ok(rejectedErr)
    })
  })

  describe('hasValues', () => {
    it('returns true if the buffer has values', () => {
      ch.buffer = {hasValues: () => true}
      ch.pendingPuts = {notEmpty: () => false}
      ok(ch.hasValues())
    })

    it('returns true if the channel has pending puts', () => {
      ch.buffer = {hasValues: () => false}
      ch.pendingPuts = {notEmpty: () => true}
      ok(ch.hasValues())
    })

    it('returns false if buffer and pending puts are empty', () => {
      ch.buffer = {hasValues: () => false}
      ch.pendingPuts = {notEmpty: () => false}
      ok(!ch.hasValues())
    })
  })

  describe('put', () => {
    it('resolves the first pending take', async () => {
      const take1 = ch.take()
      ch.take()
      const val = {}
      await ch.put(val)
      equal(await take1, val)
    })

    it('puts deferred put in the buffer', () => {
      sinon.stub(ch.buffer, 'push').returns(true)
      const val = {}
      ch.put(val)
      equal(ch.buffer.push.firstCall.args[0](), val)
    })

    it('puts deferred in pending puts if buffer is full', () => {
      sinon.stub(ch.buffer, 'push').returns(false)
      const deferredPut = {}
      const stub = sinon.stub(Deferred, 'DeferredPut').returns(deferredPut)
      ch.put({})
      equal(ch.pendingPuts.peek(), deferredPut)
      stub.restore()
    })

    it('is rejected if called on a closed channel', async () => {
      ch.close()
      let rejectedErr
      try {
        await ch.put({})
      } catch (err) {
        rejectedErr = err
      }
      ok(rejectedErr)
    })
  })

  describe('close', () => {
    beforeEach(() => {
      deferredStub.restore()
    })

    it('sets isClosed to true', () => {
      ch.close()
      ok(ch.isClosed)
    })

    it('sets isDone to true', () => {
      ch.close()
      ok(ch.isDone)
    })

    it('rejects promises for any pending puts', async () => {
      ch = new Channel(new BufferBlocking(0))
      const promise = ch.put({})
      ch.close()
      let rejectedErr
      try {
        await promise
      } catch (err) {
        rejectedErr = err
      }
      ok(rejectedErr)
    })

    it('rejects any pending takes', async () => {
      setImmediate(() => ch.close())
      let takeErr
      try {
        await ch.take()
      } catch (err) {
        takeErr = err
      }
      ok(takeErr)
    })
  })
})
