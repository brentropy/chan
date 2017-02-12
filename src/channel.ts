import {IBuffer} from './buffer'
import {Deferred, DeferredPut, PromiseWithDeferred} from './deferred'
import {CanceledTakeError, ClosedTakeError, ClosedPutError} from './error'
import {Queue} from './queue'

export interface OutChannel<T> extends PromiseLike<T> {
  take (): PromiseWithDeferred<T>
  cancelableTake (): [PromiseWithDeferred<T>, () => void]
  hasValues (): boolean
}

export interface InChannel<T> {
  put (T): Promise<void>
  close (): void
}

/**
 * A buffered asynchronous queue of values which can be used to coordinate
 * between multiple async functions. 
 */
export class Channel<T> implements InChannel<T>, OutChannel<T> {
  private pendingPuts = new Queue<DeferredPut<T>>()
  private pendingTakes = new Queue<Deferred<T>>()
  private isClosed = false
  private isDone = false

  /**
   * Creates a new Channel using any buffer that satisfies the required
   * interface.
   */
  constructor (private buffer: IBuffer<T>) {}

  /**
   * A shortcut for calling `then` on a take, allowing a channel to be awated
   * directly. If called multiple times each call with trigger a new take
   * from the channel.
   */
  public then (onFulfilled, onRejected) {
    return this.take().then(onFulfilled, onRejected)
  }

  /**
   * Return a promise that will be resolved with the next value put on the
   * channel. If there are existing values in the channel's buffer, the promise
   * will be resolved with the first value.
   * 
   * If called on a channel that is closed and has an empty buffer the promise
   * will be rejected with a `ClosedTakeError`.
   */
  public take (): PromiseWithDeferred<T> {
    const deferred = new Deferred()
    if (this.done()) {
      deferred.reject(new ClosedTakeError())
    } else if (this.hasValues()) {
      this.resolve(deferred, this.nextValue())
    } else {
      this.pendingTakes.push(deferred)
    }
    return deferred.promise
  }

  /**
   * Initial a new take from the channel returning a promise/cancel function
   * pair. If the cancel function is called before the promise resolves, the
   * take will be canceled and the next value put on the channel with be
   * handled by the next take instead.
   */
  public cancelableTake (): [PromiseWithDeferred<T>, () => void] {
    const promise = this.take()
    return [
      promise,
      () => this.removePendingTake(promise.deferred)
    ]
  }

  /**
   * Return a boolean indicating if the channel's buffer has values available
   * to be taken.
   */
  public hasValues (): boolean {
    return this.buffer.hasValues() || this.pendingPuts.notEmpty()
  }

  /**
   * Put a new value on the channel returning a promise that will be resolved
   * once the value has be added to the buffer.
   * 
   * If the channel is closed before the value is in the buffer, the returned
   * promise will be rejected with a `ClosedPutError`.
   */
  public put (value: T): Promise<void> {
    const deferred = new DeferredPut(value)
    if (this.isClosed) {
      deferred.reject(new ClosedPutError())
    } else if (this.pendingTakes.notEmpty()) {
      this.resolve(this.pendingTakes.shift(), deferred.put())
    } else if (!this.buffer.push(deferred.put)) {
      this.pendingPuts.push(deferred)
    }
    return deferred.promise
  }

  /**
   * Mark a channel as closed. All pending puts on the channel will be rejected
   * immediately. Pending takes will be rejected once all values in the buffer
   * have been taken.
   */
  public close (): void {
    this.isClosed = true
    const err = new ClosedPutError()
    let pendingPut
    while (pendingPut = this.pendingPuts.shift()) {
      pendingPut.reject(err)
    }
    this.done()
  }

  private removePendingTake (deferred: Deferred<T>): void {
    if (this.pendingTakes.remove(deferred)) {
      deferred.reject(new CanceledTakeError())
    }
  }

  private nextValue (): T | undefined {
    const pendingPut = this.pendingPuts.shift()
    if (pendingPut) {
      this.buffer.push(pendingPut.put)
    }
    return this.buffer.shift()
  }

  private resolve (deferred: Deferred<T> | undefined, value: T | undefined): void {
    if (deferred && value) {
      deferred.resolve(value)
    }
    this.done()
  }

  private done (): boolean {
    if (!this.isDone && this.isClosed && !this.buffer.hasValues()) {
      this.isDone = true
      const err = new ClosedTakeError()
      let pendingTake: Deferred<T> | undefined
      while (pendingTake = this.pendingTakes.shift()) {
        pendingTake.reject(err)
      }
    }
    return this.isDone
  }
}
