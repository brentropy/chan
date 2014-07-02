/**
 * Expose `Channel`.
 */
module.exports = Channel

/**
 * Initialize a `Channel`.
 *
 * @param {Function|Object} [empty=Object]
 * @api priate
 */
function Channel(buffer) {
  this.queue    = []
  this.items    = []
  this.isClosed = false
  this.isDone   = false
  this.empty    = {}
}

/**
 * Static reference to the most recently called callback
 */
Channel.lastCalled = null

/**
 * Get an item with `cb`.
 *
 * @param {Function} cb
 * @api private
 */
Channel.prototype.get = function(cb){
  if (this.done()) {
    this.callEmpty(cb)
  } else if (this.items.length > 0) {
    this.call(cb, this.items.shift())
  } else {
    this.queue.push(cb)
  }
}

/**
 * Remove `cb` from the queue.
 *
 * @param {Function} cb
 * @api private
 */
Channel.prototype.removeGet = function(cb) {
  var idx = this.queue.indexOf(cb)
  if (idx > -1) {
    this.queue.splice(idx, 1)
  }
}

/**
 * Add `val` to the channel.
 *
 * @param {Mixed} val
 * @api private
 */
Channel.prototype.add = function(val){
  if (this.isClosed) {
    throw new Error('Cannot add to closed channel')
  } else if (this.queue.length > 0) {
    this.call(this.queue.shift(), val)
  } else {
    this.items.push(val)
  }
}

/**
 * Invoke `cb` with `val` facilitate both
 * `chan(value)` and the `chan(error, value)`
 * use-cases.
 *
 * @param {Function} cb
 * @param {Mixed} val
 * @api private
 */
Channel.prototype.call = function(cb, val) {
  Channel.lastCalled = this.func
  if (val instanceof Error) {
    cb(val)
  } else {
    cb(null, val)
  }
  this.done()
}

/**
 * Invoke `cb` callback with the empty value.
 *
 * @param {Function} cb
 * @api private
 */
Channel.prototype.callEmpty = function(cb) {
  this.call(cb, this.empty)
}

/**
 * Prevennt future values from being added to
 * the channel.
 *
 * @return {Boolean}
 * @api public
 */
Channel.prototype.close = function() {
  this.isClosed = true
  return this.done()
}

/**
 * Check to see if the channel is done and
 * call pending callbacks if necessary.
 *
 * @return {Boolean}
 * @api private
 */
Channel.prototype.done = function() {
  if (!this.isDone && this.isClosed && this.items.length === 0) {
    this.isDone = true
    // call each pending callback with the empty value
    this.queue.forEach(function(cb) { this.callEmpty(cb) }, this)
  }
  return this.isDone
}
