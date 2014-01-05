'use strict';

var make
  , Channel
  , lastCalled;

/**
 * Make a channel.
 *
 * @param {Function|Object} [empty]
 * @return {Function}
 * @api public
 */

make = function make(empty) {
  var chan = new Channel(empty)
    , func;

  func = function(a, b) {
    // yielded
    if (typeof a === 'function') {
      return chan.get(a);
    }

    // (err, res)
    if (a === null && typeof b !== 'undefined') {
      a = b;
    }

    // value
    return chan.add(a);
  };

  // expose public channel methods
  func.close = chan.close.bind(chan);
  func.done  = chan.done.bind(chan);

  // expose empty value
  func.empty  = chan.empty;
  
  // cross reference the channel object and function for internal use
  func.__chan = chan;
  chan.func   = func;

  return func;
};

make.select = function select(/*channels...*/) {
  var selectCh = make()
    , chans = [].slice.call(arguments, 0)
    , full = chans.filter(function(ch) { return ch.__chan.items.length > 0; })
    , get;

  // define get callback
  get = function(err, value) {
    var args = arguments
      , ch   = lastCalled;

    // remove get callback from all selected channels
    chans.forEach(function(ch) { ch.__chan.removeGet(get); });

    // add temporary selected yieldable function
    ch.selected = function(cb) {
      delete ch.selected;
      cb.apply(null, args);
    };

    // added the selected channel to the select channel
    selectCh(null, ch);
    selectCh.close();
  };

  if (full.length > 1) {
    // multiple channels with waiting values, pick one at random
    full[Math.floor(Math.random() * full.length)](get);
  } else {
    // add get callback to all channels
    chans.forEach(function(ch) { ch(get); });
  }

  return selectCh;
};

/**
 * Initialize a `Channel`.
 *
 * @param {Function|Object} [empty=Object]
 * @api priate
 */

Channel = function Channel(empty) {
  var EmptyCtor;
  
  this.queue    = [];
  this.items    = [];
  this.isClosed = false;
  this.isDone   = false;
  
  if (typeof empty !== 'object') {
    EmptyCtor = typeof empty === 'function' ? empty : Object;
    empty = new EmptyCtor();
  }

  this.empty = empty;
};

/**
 * Get an item with `cb`.
 *
 * @param {Function} cb
 * @api private
 */

Channel.prototype.get = function(cb){
  if (this.done()) {
    this.callEmpty(cb);
  } else if (this.items.length > 0) {
    this.call(cb, this.items.shift());
  } else {
    this.queue.push(cb);
  }
};

/**
 * Remove `cb` from the queue.
 *
 * @param {Function} cb
 * @api private
 */

Channel.prototype.removeGet = function(cb) {
  var idx = this.queue.indexOf(cb);
  if (idx > -1) {
    this.queue.splice(idx, 1);
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
  } else if (this.queue.length > 0) {
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

Channel.prototype.call = function(cb, val) {
  lastCalled = this.func;
  if (val instanceof Error) {
    cb(val);
  } else {
    cb(null, val);
  }
  this.done();
};

/**
 * Invoke `cb` callback with the empty value.
 *
 * @param {Function} cb
 * @api private
 */

Channel.prototype.callEmpty = function(cb) {
  this.call(cb, this.empty);
};

/**
 * Prevennt future values from being added to
 * the channel.
 *
 * @return {Boolean}
 * @api public
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
  if (!this.isDone && this.isClosed && this.items.length === 0) {
    this.isDone = true;
    // call each pending callback with the empty value
    this.queue.forEach(function(cb) { this.callEmpty(cb); }, this);
  }

  return this.isDone;
};

/**
 * Expose `make()`.
 */

module.exports = make;

