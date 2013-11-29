// jshint esnext:true
'use strict';

var request = require('superagent')
  , chan    = require('../chan')
  , co      = require('co')
  , urls;

urls = [
  'http://google.com',
  'http://medium.com',
  'http://segment.io',
  'http://cloudup.com'
];

co(function *() {
  var ch = chan()
    , res;

  urls.forEach(function(url) {
    request.get(url, ch);
  });

  while ((res = yield ch)) {
    console.log(res.status);
  }
})();
