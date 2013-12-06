/* global describe:true, beforeEach:true, it:true */
'use strict';

var chan   = require('../chan')
  , expect = require('expect.js');

describe('A closed channel', function() {

  it(
    'should throw an error when attempting to add a value',
    function() {
      var ch = chan();
      ch.close();
      expect(function() { ch('foo'); }).to.throwError();
    }
  );

  describe('that is not empty', function() {

    it(
      'should return `false` when the `done()` method is called',
      function() {
        var ch = chan();
        ch('foo');
        ch.close();
        expect(ch.done()).to.be(false);
      }
    );

  });

  describe('that is empty', function() {
    
    it(
      'should invoke peding callbacks with empty value',
      function() {
        var ch = chan();
        ch(function(err, value) {
          expect(value).to.be(ch.empty);
        });
        ch.close();
      }
    );

    it(
      'should return `true` when the `done()` method is called',
      function() {
        var ch = chan();
        ch.close();
        expect(ch.done()).to.be(true);
      }
    );

    it(
      'should immediately invoke any callback added with the empty value',
      function() {
        var ch = chan();
        ch.close();
        ch(function(err, value) {
          expect(value).to.be(ch.empty);
        });
      }
    );

  });

});
