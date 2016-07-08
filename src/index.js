import {blockingChannel, slidingChannel, droppingChannel} from './factory'
import Channel from './channel'
import timeout from './timeout'
import alts from './alts'
import select from './select'

exports = module.exports = blockingChannel
exports.sliding = slidingChannel
exports.dropping = droppingChannel
exports.Channel = Channel
exports.timeout = timeout
exports.alts = alts
exports.select = select
