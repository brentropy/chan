'use strict';

var make
  , Channel;

/**
 * Make a channel.
 *
 * @return {Function}
 * @api public
 */

make = function make() {
  var chan = new Channel()
    , func;

  func = function(a, b) {
    // yielded
    if (typeof a === 'function') {
      chan.get(a);
      return;
    }

    // (err, res)
    if (a === null && typeof b !== 'undefined') {
      a = b;
    }

    // value
    return chan.add(a);
  };

  // expose Channel.protoptype.close
  func.close = chan.close.bind(chan);

  // expose Channel.protoptype.done
  func.done = chan.done.bind(chan);

  return func;
};

/**
 * Initialize a `Channel`.
 *
 * @api priate
 */

Channel = function Channel() {
  this.queue    = [];
  this.items    = [];
  this.isClosed = false;
  this.isDone   = false;
};

/**
 * Get an item with `cb`.
 *
 * @param {Function} cb
 * @api private
 */

Channel.prototype.get = function(cb){
  if (this.items.length > 0) {
    this.call(cb, this.items.shift());
  } else {
    this.queue.push(cb);
  }
};

/**
 * Add `val` to the channel.
 *
 * @param {Mixed} val
 * @api private
 */

Channel.prototype.add = function(val){
  if (this.isClosed) {
    throw new Error('Cannot add to closed channel');
  }
  if (this.queue.length > 0) {
    this.call(this.queue.shift(), val);
  } else {
    this.items.push(val);
  }
};

/**
 * Invoke `cb` with `val` facilitate both
 * `chan(value)` and the `chan(error, value)`
 * use-cases.
 *
 * @param {Function} cb
 * @param {Mixed} val
 * @api private
 */

Channel.prototype.call = function(cb, val){
  if (val instanceof Error) {
    cb(val);
  } else {
    cb(null, val);
  }
  this.done();
};

/**
 * Prevennt future values from being added to
 * the channel.
 *
 * @api private
 */

Channel.prototype.close = function() {
  this.isClosed = true;
  return this.done();
};

/**
 * Check to see if the channel is done and
 * call pending callbacks if necessary.
 *
 * @return {Boolean}
 * @api private
 */

Channel.prototype.done = function() {
  var _this = this;
  if (!this.isDone && this.isClosed && this.items.length === 0) {
    this.isDone = true;
    this.queue.forEach(function(cb) {
      _this.call(cb, void 0);
    });
  }
  return this.isDone;
};

/**
 * Expose `make()`.
 */

module.exports = make;

