export class DeferredBase {
  constructor () {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}

export class DeferredTake extends DeferredBase {
  take (value) {
    if (value instanceof Error) {
      this.reject(value)
    } else {
      this.resolve(value)
    }
  } 
}

export class DeferredPut extends DeferredBase {
  constructor (value) {
    super()
    this.value = value
  }

  put () {
    this.resolve()
    return this.value
  }
}
