import {default as Deferred, DeferredPut} from './deferred'

const CLOSED_ERROR_MSG = 'Cannot add to closed channel'
const CANCELED_TAKE_ERROR_MSG = 'Pending take from channel was canceled'

export default class Channel {
  constructor (buffer) {
    this.buffer = buffer
    this.pendingPuts = []
    this.pendingTakes = []
    this.isClosed = false
    this.isDone = false
    this.empty = {}
  }

  then (onFulfilled, onRejected) {
    return this.take().then(onFulfilled, onRejected)
  }

  take () {
    const deferred = new Deferred()
    if (this.done()) {
      this.resolveEmpty(deferred)
    } else if (this.hasValues()) {
      this.resolve(deferred, this.nextValue())
    } else {
      this.pendingTakes.push(deferred)
    }
    return deferred.promise
  }

  cancelableTake () {
    const promise = this.take()
    return [
      promise,
      () => this.removePendingTake(promise.deferred)
    ]
  }

  /**
   * @api private
   */
  removePendingTake (deferred) {
    const idx = this.pendingTakes.indexOf(deferred)
    if (idx > -1) {
      this.pendingTakes.splice(idx, 1)
      deferred.reject(new Error(CANCELED_TAKE_ERROR_MSG))
    }
  }

  hasValues () {
    return this.buffer.hasValues() || this.pendingPuts.length > 0
  }

  /**
   * @api private
   */
  nextValue () {
    if (this.pendingPuts.length > 0) {
      this.buffer.push(this.pendingPuts.shift().put())
    }
    return this.buffer.shift()
  }

  put (value) {
    var deferred = new DeferredPut(value)
    if (this.isClosed) {
      deferred.reject(new Error(CLOSED_ERROR_MSG))
    } else if (this.pendingTakes.length > 0) {
      this.resolve(this.pendingTakes.shift(), deferred.put())
    } else if (!this.buffer.push(deferred.put)) {
      this.pendingPuts.push(deferred)
    }
    return deferred.promise
  }

  /**
   * @api private
   */
  resolve (deferred, value) {
    deferred.resolve(value)
    this.done()
  }

  /**
   * @api private
   */
  resolveEmpty (deferred) {
    this.resolve(deferred, this.empty)
  }

  close () {
    this.isClosed = true
    const err = new Error(CLOSED_ERROR_MSG)
    this.pendingPuts.forEach((deferred) => deferred.reject(err))
    return this.done()
  }

  /**
   * @api private
   */
  done () {
    if (!this.isDone && this.isClosed && !this.buffer.hasValues()) {
      this.isDone = true
      this.pendingTakes.forEach(this.resolveEmpty, this)
    }
    return this.isDone
  }
}
