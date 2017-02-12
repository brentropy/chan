export class PromiseWithDeferred<T> extends Promise<T> {
  public deferred: Deferred<T>
}

export class Deferred<T> {
  public promise: PromiseWithDeferred<T>
  public resolve: (value: T) => void
  public reject: (err: Error) => void

  constructor () {
    this.promise = new PromiseWithDeferred((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
    this.promise.deferred = this
  }
}

export class DeferredPut<T> extends Deferred<void> {
  public put: () => T

  constructor (private value: T) {
    super()
    this.put = () => {
      this.resolve(undefined)
      return this.value
    }
  }
}
