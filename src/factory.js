import Channel from './channel'
import {BufferBlocking, BufferSliding, BufferDropping} from './buffer'

export function blockingChannel (size) {
  return new Channel(new BufferBlocking(size))
}

export function slidingChannel (size) {
  return new Channel(new BufferSliding(size))
}

export function droppingChannel (size) {
  return new Channel(new BufferDropping(size))
}
