import {blockingChannel, slidingChannel, droppingChannel} from './factory'
import Channel from './channel'
import timeout from './timeout'

const chan = blockingChannel
chan.sliding = slidingChannel
chan.dropping = droppingChannel
chan.Channel = Channel
chan.timeout = timeout

export default chan
