import Channel from './channel'
import {BufferBlocking, BufferSliding, BufferDropping} from './buffer'

function chan (size) {
  return new Channel(new BufferBlocking(size))
}

function sliding (size) {
  return new Channel(new BufferSliding(size))
}

function dropping (size) {
  return new Channel(new BufferDropping(size))
}

chan.sliding = sliding
chan.dropping = dropping
chan.Channel = Channel

export default chan
