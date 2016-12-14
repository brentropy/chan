import {blockingChannel} from './factory'
import {Channel} from './channel'

/**
 * Create a new channel that will receive a single value after a given number
 * of milliseconds. The channel will be closed and cannot be reused.
 */
export function timeout (ms: number): Channel<null> {
  const ch = blockingChannel<null>()
  setTimeout(() => {
    try {
      ch.put(null)
      ch.close()
    } catch (err) {}
  }, ms)
  return ch
}
