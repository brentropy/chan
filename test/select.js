/* global describe:true, beforeEach:true, it:true */
'use strict';

var chan   = require('../chan')
  , expect = require('expect.js');

describe('Channel select', function() {
  var random;
  beforeEach(function(done) {
    // save Math.random
    random = Math.random;
    done();
  });

  afterEach(function (done) {
    // restore Math.random
    Math.random = random;
    done();
  });

  it(
    'should be able to select on channels',
    function(done) {
      var ch1 = chan(),
          ch2 = chan();
      chan.select([ch1, ch2])(function (err, ch) {
        expect(ch).to.equal(ch2);
        ch2(function (err, val) {
          expect(val).to.equal(42);
          done();
        });
      });
      ch2(42);
    }
  );

  it(
    'should be able to select on multiple channels',
    function(done) {
      var chs = [chan(), chan()];
      var remaining = chs.length;
      chs.forEach(function (needle, i) {
        chan.select(chs)(function (err, ch) {
          expect(ch).to.equal(needle);
          ch(function (err, val) {
            expect(val).to.equal(i*10);
            --remaining || done();
          });
        });
      });
      chs.forEach(function (ch, i) {
        ch(i*10);
      });
    }
  );

  it(
    'should be able to select with queued messages',
    function(done) {
      var chs = [chan(), chan()];
      var remaining = chs.length;
      for (var i = 0; i < 10; i++) {
        (function (i) {
          chan.select(chs)(function (err, ch) {
            expect(ch).to.equal(chs[0]);
            ch(function (err, val) {
              expect(val).to.equal(i*10);
              --remaining || done();
            });
          });
        })(i);
      }
      for (var j = 0; j < 10; j++) {
        chs[0](j*10);
      }
    }
  );

  it(
    'should be able to select with existing messages on the channels',
    function(done) {
      var ch1 = chan(),
          ch2 = chan();
      ch2(42);
      chan.select([ch1, ch2])(function (err, ch) {
        expect(ch).to.equal(ch2);
        ch2(function (err, val) {
          expect(val).to.equal(42);
          done();
        });
      });
    }
  );

  it(
    'should be randomly choose a channel to return when there are multiple full channels',
    function(done) {
      var ch1 = chan(),
          ch2 = chan();

      // force the random selection to be the second channel
      Math.random = function () { return 0.5; }

      // fill up both the channels
      ch1(21);
      ch2(42);

      // random selection should choose the second channel "randomly"
      chan.select([ch1, ch2])(function (err, ch) {
        expect(ch).to.equal(ch2);
        ch2(function (err, val) {
          expect(val).to.equal(42);
          done();
        });
      });
    }
  );
});
