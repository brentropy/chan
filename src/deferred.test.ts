import {equal, ok} from 'assert'
import * as sinon from 'sinon'
import {describe, it, beforeEach, afterEach} from 'mocha'
import {Deferred, DeferredPut} from './deferred'

describe('Deferred', () => {

  describe('constructor', () => {
    let deferred

    beforeEach(() => {
      deferred = new Deferred()
    })

    it('creates a new promise', () => {
      ok(deferred.promise instanceof Promise)
    })

    it('resolve fulfills the promise with value', async () => {
      const expected = 'value'
      deferred.resolve(expected)
      equal(await deferred.promise, expected)
    })

    it('reject rejects the promise with error', async () => {
      const expected = {}
      deferred.reject(expected)
      let err
      try {
        await deferred.promise
      } catch (e) {
        err = e
      }
      equal(err, expected)
    })
  })

  describe('DeferredPut', () => {
    let value
    let deferred

    beforeEach(() => {
      value = 'something'
      deferred = new DeferredPut(value)
    })

    it('resolves the promise with undefined', async () => {
      deferred.put()
      equal(await deferred.promise, undefined)
    })

    it('returns the value', async () => {
      equal(deferred.put(), value)
    })
  })
})
