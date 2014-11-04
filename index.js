/**
 * Module dependencies.
 */
var make     = require('./lib/make')
var select   = require('./lib/select')
var timeout  = require('./lib/timeout')
var interval = require('./lib/interval')

/**
 * Expose `make`.
 */
module.exports = make

/**
 * Expose `select`.
 */
module.exports.select = select

/**
 * Expose `interval`.
 */
module.exports.interval = interval

/**
 * Expose `timeout`.
 */
module.exports.timeout = timeout
