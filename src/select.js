import alts from './alts'

const DEFAULT = {hasValues: () => false}

export default function select (...args) {
  const handlers = new Map()
  for (let i = 0, len = args.length; i < len; i += 2) {
    if (args[i + 1]) {
      handlers.set(args[i], args[i + 1])
    } else {
      handlers.set(DEFAULT, args[i])
    }
  }
  const channels = handlers.keys()
  if (handlers.get(DEFAULT) && !channels.some(c => c.hasValues()).length) {
    return Promise.resove(handlers.get(DEFAULT)())
  } else {
    return alts(channels).then(([ch, val]) => handlers.get(ch)(val))
  }
}
