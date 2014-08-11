/**
 * Module dependencies.
 */
var make = require('./make')

/**
 * Expose `intervalChan`.
 */
module.exports = intervalChan

/**
 * Make a interval channel that receives a count every number of milliseconds.
 * 
 * @param {Number} ms
 * @returns {Function} channel
 * @api public
 */
function intervalChan(ms) {
  var ch    = make()
  var count = 0;

  var int = setInterval(function () {
    try {
      ch(++count)
    } catch (err) {
      clearInterval(int)
    }
  }, ms)

  return ch
}
