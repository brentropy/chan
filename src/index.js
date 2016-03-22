import {blockingChannel, slidingChannel, droppingChannel} from './factory'
import Channel from './channel'
import timeout from './timeout'
import alts from './alts'

const chan = blockingChannel
chan.sliding = slidingChannel
chan.dropping = droppingChannel
chan.Channel = Channel
chan.timeout = timeout
chan.alts = alts

export default chan
