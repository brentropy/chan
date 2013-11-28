'use strict';

module.exports = make;

function call(value, cb) {
  if (value instanceof Error) {
    cb(value);
  } else {
    cb(null, value);
  }
}

function arg(args) {
  if (null == args[0] && args.length > 1) return args[1];
  return args[0];
}

function make() {
  var items  = []
    , queue  = [];
  return function(cb) {
    if (typeof cb !== 'function') {
      if (queue.length > 0) {
        call(arg(arguments), queue.shift());
      } else {
        items.push(arg(arguments));
      }
    } else {
      if (items.length > 0) {
        call(items.shift(), cb);
      } else {
        queue.push(cb);
      }
    }
  };
}