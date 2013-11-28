
var request = require('superagent');
var chan = require('../chan');
var co = require('co');

var urls = [
  'http://google.com',
  'http://medium.com',
  'http://segment.io',
  'http://cloudup.com'
];

co(function *(){
  var ch = chan();

  urls.forEach(function(url){
    request.get(url, ch);
  });

  var res;
  while (res = yield ch) {
    console.log(res.status);
  }
})();