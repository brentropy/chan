import {blockingChannel} from './factory'

export function timeout (ms) {
  const ch = blockingChannel()
  setTimeout(() => {
    try {
      ch(true)
      ch.close()
    } catch (err) {}
  }, ms)
  return ch
}
