import {ok, equal, notEqual} from 'assert'
import {describe, it, beforeEach, afterEach} from 'mocha'
import * as buffer from './buffer'

describe('Buffer', () => {
  function common (Buffer) {
    describe(`${Buffer.name} common`, () => {
      describe('constructor', () => {
        it('sets size from argument', () => {
          const size = 47
          const b = new Buffer(size)
          equal(b.size, size)
        })
      })

      describe('shift', () => {
        it('removes the first value from the buffer', () => {
          const b = new Buffer(47)
          b.push(() => 1)
          b.push(() => 2)
          equal(b.shift(), 1)
        })
      })

      describe('hasValues', () => {
        it('returns true if the buffer has values', () => {
          const b = new Buffer(47)
          b.push(() => 1)
          ok(b.hasValues())
        })

        it('returns false if the buffer has no values', () => {
          const b = new Buffer(47)
          ok(!b.hasValues())
        })
      })
    })
  }

  common(buffer.BufferBlocking)
  common(buffer.BufferSliding)
  common(buffer.BufferDropping)

  describe('BufferBlocking push', () => {
    it('puts getValue() on buffer and returns true if there is room', () => {
      const b = new buffer.BufferBlocking(1)
      const val = {}
      equal(b.push(() => val), true)
      equal(b.shift(), val)
    })

    it('returns false if there is not room', () => {
      const b = new buffer.BufferBlocking(1)
      const val = {}
      b.push(() => ({}))
      ok(!b.push(() => val))
      b.shift()
      notEqual(b.shift(), val)
    })
  })

  describe('BufferSliding push', () => {
    it('puts getValue() on buffer and returns true if there is room', () => {
      const b = new buffer.BufferSliding(1)
      const val = {}
      equal(b.push(() => val), true)
      equal(b.shift(), val)
    })

    it('puts getValue() on buffer and removes first value if no room', () => {
      const b = new buffer.BufferSliding(2)
      b.push(() => 1)
      b.push(() => 2)
      equal(b.push(() => 3), true)
      equal(b.shift(), 2)
      equal(b.shift(), 3)
    })
  })

  describe('BufferDropping push', () => {
    it('puts getValue() on buffer and returns true if there is room', () => {
      const b = new buffer.BufferDropping(1)
      const val = {}
      equal(b.push(() => val), true)
      equal(b.shift(), val)
    })

    it('does not put value on buffer and returns true if no room', () => {
      const b = new buffer.BufferDropping(2)
      b.push(() => 1)
      b.push(() => 2)
      equal(b.push(() => 3), true)
      equal(b.shift(), 1)
      equal(b.shift(), 2)
    })
  })
})
