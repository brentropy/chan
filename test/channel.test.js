import {ok, equal, deepEqual} from 'assert'
import mochon from 'mochon'
import Channel from '../src/channel'
import Deferred, * as allDeferred from '../src/deferred'
import {BufferBlocking} from '../src/buffer'

describe('Channel', () => {
  const sinon = mochon()

  let ch, buffer, deferred

  beforeEach(() => {
    deferred = new Deferred()
    buffer = new BufferBlocking(5)
    ch = new Channel(buffer)
    sinon.stub(allDeferred, 'default').returns(deferred)
  })

  describe('constructor', () => {
    it('sets buffer prop from arg', () => {
      equal(ch.buffer, buffer)
    })

    it('sets initial properties', () => {
      deepEqual(ch.pendingPuts, [])
      deepEqual(ch.pendingTakes, [])
      equal(ch.isClosed, false)
      equal(ch.isDone, false)
      deepEqual(ch.empty, {})
    })
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

    it('resolve with empty when called on a closed channel', async () => {
      ch.close()
      equal(await ch.take(), ch.empty)
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
      Deferred.restore()
      const [, cancel] = ch.cancelableTake()
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
      ch.pendingPuts = {length: 0}
      ok(ch.hasValues())
    })

    it('returns true if the channel has pending puts', () => {
      ch.buffer = {hasValues: () => false}
      ch.pendingPuts = {length: 1}
      ok(ch.hasValues())
    })

    it('returns false if buffer and pending puts are empty', () => {
      ch.buffer = {hasValues: () => false}
      ch.pendingPuts = {length: 0}
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
      sinon.stub(allDeferred, 'DeferredPut').returns(deferredPut)
      ch.put({})
      equal(ch.pendingPuts[0], deferredPut)
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

    it('resolves any pending takes with empty value', async () => {
      setImmediate(() => ch.close())
      equal(await ch.take(), ch.empty)
    })
  })
})
