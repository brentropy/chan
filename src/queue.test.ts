import {equal, ok} from 'assert'
import * as sinon from 'sinon'
import {describe, it, beforeEach, afterEach} from 'mocha'
import {Queue} from './queue'

describe('Queue', () => {
  let queue: Queue<number>

  beforeEach(() => {
    queue = new Queue<number>()
  })

  describe('push/shift', () => {
    it('is first in first out', () => {
      queue.push(1)
      queue.push(2)
      queue.push(3)
      equal(queue.shift(), 1)
      equal(queue.shift(), 2)
      equal(queue.shift(), 3)
    })
  })

  describe('peek', () => {
    it('returns the first value', () => {
      queue.push(1)
      equal(queue.peek(), 1)
    })

    it('does not remove the first value from the queue', () => {
      queue.push(1)
      queue.peek()
      equal(queue.shift(), 1)
    })
  })

  describe('size', () => {
    it('returns the number of values push on the queue', () => {
      queue.push(1)
      queue.push(2)
      equal(queue.size(), 2)
    })

    it('returns zero for empty queues', () => {
      equal(queue.size(), 0)
    })

    it('returns the size reduced by the number of values shifted', () => {
      queue.push(1)
      queue.push(2)
      queue.shift()
      equal(queue.size(), 1)
    })
  })

  describe('empty', () => {
    it('returns true when no values are in the queue', () => {
      equal(queue.empty(), true)
      queue.push(1)
      queue.shift()
      equal(queue.empty(), true)
    })

    it('returns false when values are in the queue', () => {
      queue.push(1)
      equal(queue.empty(), false)
    })
  })

  describe('notEmpty', () => {
    it('returns false when no values are in the queue', () => {
      equal(queue.notEmpty(), false)
      queue.push(1)
      queue.shift()
      equal(queue.notEmpty(), false)
    })

    it('returns true when values are in the queue', () => {
      queue.push(1)
      equal(queue.notEmpty(), true)
    })
  })

  describe('remove', () => {
    it('removes value from the queue', () => {
      queue.push(1)
      queue.push(2)
      queue.push(3)
      queue.remove(2)
      equal(queue.shift(), 1)
      equal(queue.shift(), 3)
    })

    it('returns true if value was removed', () => {
      queue.push(1)
      equal(queue.remove(1), true)
    })

    it('returns false if value was not found', () => {
      queue.push(1)
      equal(queue.remove(2), false)
    })
  })
})
