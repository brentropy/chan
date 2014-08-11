/**
 * Module dependencies.
 */
var make = require('./make')

/**
 * Expose `timeoutChan`.
 */
module.exports = timeoutChan

/**
 * Make a timeout channel that receives `true` after a number of milliseconds.
 * 
 * @param {Number} ms
 * @returns {Function} channel
 * @api public
 */
function timeoutChan(ms) {
  var ch = make()
  
  setTimeout(function () {
    try {
      ch(true)
      ch.close()
    } catch(err) {}
  }, ms)

  return ch
}
