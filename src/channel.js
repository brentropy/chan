import {default as Deferred, DeferredPut} from './deferred'

const CLOSED_ERROR_MSG = 'Cannot add to closed channel'

export default class Channel {
  pendingPuts = []
  pendingTakes = []
  isClosed = false
  isDone = false
  empty = {}

  constructor (buffer) {
    this.buffer = buffer
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

  removePendingTake (deferred) {
    const idx = this.pendingTakes.indexOf(deferred)
    if (idx > -1) {
      this.pendingTakes.splice(idx, 1)
    }
  }

  hasValues () {
    return this.buffer.length > 0 || this.pendingPuts.length > 0
  }

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
    } else if (!this.buffer.push(deferred.put.bind(deferred))) {
      this.pendingPuts.push(deferred)
    }
    return deferred.promise
  }

  resolve (deferred, value) {
    deferred.resolve(value)
    this.done()
  }

  resolveEmpty (deferred) {
    this.resolve(deferred, this.empty)
  }

  close () {
    this.isClosed = true
    let receiver
    while (receiver = this.pendingPuts.shift()) {
      receiver.error(new Error(CLOSED_ERROR_MSG))
    }
    return this.done()
  }

  done () {
    if (!this.isDone && this.isClosed && this.buffer.length === 0) {
      this.isDone = true
      this.pendingTakes.forEach(this.resolveEmpty, this)
    }
    return this.isDone
  }
}
