import {BufferBlocking, BufferSliding, BufferDropping} from './buffer'
import {Channel} from './channel'

/**
 * Create a channel with a blocking buffer of a given size. If the buffer is
 * full, calls to `put` will block until there is room in the buffer. Once
 * space if available the value will be added to the end of the buffer and
 * the returned promise will resolve allowing execution of the calling async
 * function to continue.
 * 
 * If called without a buffer size, it will default to `0` and will function as
 * an unbuffered channel. Calls to `put` will block until another async
 * function calls `take` on the channel.
 */
export function blockingChannel<T> (size: number = 0): Channel<T> {
  return new Channel<T>(new BufferBlocking<T>(size))
}

/**
 * Creata a channel with a sliding buffer of a given size. If the buffer is
 * full, calls to `put` will cause the first value in the buffer to drop and
 * the new value will be added to the end of the buffer.
 */
export function slidingChannel<T> (size: number): Channel<T> {
  return new Channel<T>(new BufferSliding<T>(size))
}

/**
 * Create a channel with a dropping buffer of a given size. If the buffer is
 * full, calls to `put` will be ignored and the value will not be added to the
 * channel.
 */
export function droppingChannel<T> (size: number): Channel<T> {
  return new Channel<T>(new BufferDropping<T>(size))
}
