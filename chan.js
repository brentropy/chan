
/**
 * Expose `make()`.
 */

module.exports = make;

/**
 * Make a channel.
 *
 * @return {Function}
 * @api public
 */

function make() {
  var chan = new Channel;

  return function(a, b) {
    // yielded
    if ('function' == typeof a) {
      chan.get(a);
      return;
    }

    // (err, res)
    if (null == a && null != b) a = b;

    // value
    chan.add(a);
  }
}

function Channel() {
  this.queue = [];
  this.items = [];
}

Channel.prototype.get = function(cb){
  if (this.items.length) {
    cb(null, this.items.pop());
  } else {
    this.queue.push(cb);
  }
};

Channel.prototype.add = function(val){
  if (this.queue.length) {
    this.call(this.queue.pop(), val);
  } else {
    this.items.push(val);
  }
};

Channel.prototype.call = function(cb, val){
  if (val instanceof Error) {
    cb(val);
  } else {
    cb(null, val);
  }
};