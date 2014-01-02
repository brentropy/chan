'use strict';

var make
  , Channel
  , selectors = [];   // selectors waiting for channel activity

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

  // expose empty value
  func.empty = chan.empty;

  // save a reference to the channel
  func.__chan = chan;

  return func;
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

  this.empty    = empty;
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
    notifySelectors(this);
  } else {
    this.items.push(val);
    notifySelectors(this);
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
  if (!this.isDone && this.isClosed && this.items.length === 0) {
    this.isDone = true;
    this.queue.forEach(
      function(cb) {
        this.callEmpty(cb);
      },
      this
    );
  }

  return this.isDone;
};

/**
 * Expose `make()`.
 */

module.exports = make;

/**
 * Wait for activity on a list of channels.
 *
 * @param {channel[]} channels
 * @api public
 */

module.exports.select = select;
function select(channels) {
  return function(cb) {
    selectors.push({ channels: channels, cb: cb });
    // check to see if there are any waiting messages
    channels.some(function (ch) {
      var channel = ch.__chan;
      return !channel.isDone && channel.items.length &&
        notifySelectors(channel);
    });
  };
}

/**
 * Notify anyone waiting on a select()
 *
 * @api private
 */

function notifySelectors(ch) {
  selectors.forEach(function (selector, pos) {
    // is this selector waiting for this channel?
    var selectorHasChannel = selector.channels.some(
      function (func) {
        return ch === func.__chan;
      });
    if (selectorHasChannel) {
      // find the channels with items ready
      var hits = selector.channels.filter(function (func) {
        var channel = func.__chan;
        return !channel.isDone && channel.items.length;
      });

      if (hits.length) {
        var idx = 0;
        // if multiple ready channels, then pick a channel at random
        if (hits.length > 1) {
          idx = Math.floor(Math.random() * hits.length);
        }

        // remove selector from notification list
        selectors.splice(pos, 1);
        selector.cb(null, hits[idx]);
        return true;
      }
    }
  });
}
