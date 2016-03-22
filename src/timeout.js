import {blockingChannel} from './factory'

export default function timeout (ms) {
  const ch = blockingChannel()
  setTimeout(() => {
    try {
      ch.put(true)
      ch.close()
    } catch (err) {}
  }, ms)
  return ch
}
