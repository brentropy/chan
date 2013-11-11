'use strict';

var call
  , arg
  , make;

call = function(value, cb) {
  if (value instanceof Error) {
    cb(value);
  } else {
    cb(null, value);
  }
};

arg = function(args) {
  var i = 0;
  if (args[0] === null && args.length > 1) {
    i = 1;
  }
  return args[i];
};

make = function() {
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
};

module.exports = make;
