export default class Deferred {
  constructor () {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
    this.promise.deferred = this
  }
}

export class DeferredPut extends Deferred {
  constructor (value) {
    super()
    this.value = value
  }

  put () {
    this.resolve()
    return this.value
  }
}
