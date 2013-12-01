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
  var chan = new Channel();

  return function(a, b) {
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
    chan.add(a);
  };
};

/**
 * Initialize a `Channel`.
 *
 * @api priate
 */

Channel = function Channel() {
  this.queue = [];
  this.items = [];
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
};

/**
 * Expose `make()`.
 */

module.exports = make;

