import {ok, equal, notEqual, deepEqual} from 'assert'
import * as buffer from '../src/buffer'

describe('BufferBase', () => {
  describe('constructor', () => {
    it('sets size from argument', () => {
      const size = 47
      const b = new buffer.BufferBase(size)
      equal(b.size, size)
    })

    it('sets size to 0 if argument is not a number', () => {
      const size = 'cat'
      const b = new buffer.BufferBase(size)
      equal(b.size, 0)
    })
  })

  describe('shift', () => {
    it('removes the first value from the buffer', () => {
      const b = new buffer.BufferBase(47)
      b.values = [1, 2, 3]
      equal(b.shift(), 1)
    })
  })

  describe('hasValues', () => {
    it('returns true if the buffer has values', () => {
      const b = new buffer.BufferBase(47)
      b.values = [1]
      ok(b.hasValues())
    })

    it('returns false if the buffer has no values', () => {
      const b = new buffer.BufferBase(47)
      b.values = []
      ok(!b.hasValues())
    })
  })

  describe('BufferBlocking push', () => {
    it('puts getValue() on buffer and returns true if there is room', () => {
      const b = new buffer.BufferBlocking(1)
      const val = {}
      equal(b.push(() => val), true)
      equal(b.values[0], val)
    })

    it('returns false if there is not room', () => {
      const b = new buffer.BufferBlocking(1)
      const val = {}
      b.push(() => {})
      ok(!b.push(() => val))
      notEqual(b.values[1], val)
    })
  })

  describe('BufferSliding push', () => {
    it('puts getValue() on buffer and returns true if there is room', () => {
      const b = new buffer.BufferSliding(1)
      const val = {}
      equal(b.push(() => val), true)
      equal(b.values[0], val)
    })

    it('puts getValue() on buffer and removes first value if no room', () => {
      const b = new buffer.BufferSliding(2)
      b.push(() => 1)
      b.push(() => 2)
      equal(b.push(() => 3), true)
      deepEqual(b.values, [2, 3])
    })
  })

  describe('BufferDropping push', () => {
    it('puts getValue() on buffer and returns true if there is room', () => {
      const b = new buffer.BufferDropping(1)
      const val = {}
      equal(b.push(() => val), true)
      equal(b.values[0], val)
    })

    it('does not put value on buffer and returns true if no room', () => {
      const b = new buffer.BufferDropping(2)
      b.push(() => 1)
      b.push(() => 2)
      equal(b.push(() => 3), true)
      deepEqual(b.values, [1, 2])
    })
  })
})
