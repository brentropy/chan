import Deferred from './deferred'

function pairs ()

export function select (channels...) {
  const deferred = new Deferred()
  const nonEmpty = channels.filter(channel => channel.hasValues())
  const cancels = []
  let remaining = channels.length

  const take = channel => {
    const [promise, cancel] = channel.cancelableTake()
    cancels.push(cancel)  
    promise.then(value => {
      if (value === channel.empty && --remaining > 0) {
        return
      }
      cancels.forEach(fn => fn())
      deferred.resolve([channel, value])
    })
  }

  if (nonEmpty.length > 1) {
    take(nonEmpty[Math.random() * nonEmpty.length | 0])
  } else {
    channels.forEach(take)
  }

  return deferred.promise
}
