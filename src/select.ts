import {OutChannel} from './channel'
import {Deferred} from './deferred'
import {ClosedTakeError} from './error'
import {timeout} from './timeout'

/**
 * Create a new thenable select with support for chaning `case`, `timeout` and
 * `default` methods.
 */
export function select (): Selector {
  return new Selector()
}

/**
 * A thenable builder that allows adding handlers for multiple channels as well
 * as a timeout or default handler. The thenable resolves once on of the
 * handlers has been called. If the handler is asynchronous (returns a promise)
 * the selector will resolve once the handler is resolved.
 * 
 * If a default is specified, it will be called immediatly if non of the
 * channels have values ready to take. If multiple channels have a pending
 * value, one channel will be chosen at random.
 */
export class Selector implements PromiseLike<void> {
  private handlers = new Map()
  private defaultFn: (() => Promise<void> | void) | undefined
  private cancels: Array<() => void> = []
  private deferred = new Deferred<void>()
  private remaining = 0
  private executed = false

  /**
   * Add a channel to the select along with the function to be called with its
   * value if the channel is selected. If the function is an async function or
   * any function that returns a promise. The select will not resolve until
   * the returned promise resolves.
   */
  public case<T> (ch: OutChannel<T>, fn: (T) => Promise<void> | void): this {
    this.handlers.set(ch, (value: any) => fn(value as T))
    return this
  }

  /**
   * A shortcut for adding a case to the select with a timeout channel. If
   * another channel in the select does not have a value to take within the
   * given number of milliseconds, the timeout handler will be called instead.
   */
  public timeout (ms: number, fn: () => Promise<void> | undefined): this {
    this.case(timeout(ms), fn)
    return this
  }

  /**
   * Register a handler function to be called if none of the channels have a
   * value to take at the time of the select. If the select has a default it
   * will always resolve immediatly.
   */
  public default (fn: () => Promise<void> | void): this {
    this.defaultFn = fn
    return this
  }

  /**
   * Executes the select by taking from one or more channels, or by calling the
   * default handler. If a take is initiated from more than one channel, all
   * other takes will be canceled after the first one resolves.
   */
  public then (onFulfilled, onRejected) {
    if (!this.executed) {
      this.execute()
    }
    return this.deferred.promise.then(onFulfilled, onRejected)
  }

  private execute ():void {
    const channels = Array.from(this.handlers.keys())
    const nonEmpty = channels.filter(c => c.hasValues())
    if (this.defaultFn && nonEmpty.length === 0) {
      const done = Promise.resolve(this.defaultFn())
      done.then(this.deferred.resolve, this.deferred.reject)
    } else if (nonEmpty.length > 0) {
      this.take(nonEmpty[Math.random() * nonEmpty.length | 0])
    } else {
      this.remaining = channels.length
      channels.forEach(c => this.take(c))
    }
    this.executed = true
  }

  private take<T> (channel: OutChannel<T>): void {
    const [promise, cancel] = channel.cancelableTake()
    this.cancels.push(cancel)
    promise.then((value) => {
      this.cancels.forEach(fn => fn())
      const done = Promise.resolve(this.handlers.get(promise)(value))
      done.then(this.deferred.resolve, this.deferred.reject)
    }).catch((err) => {
      if (err instanceof ClosedTakeError === false || --this.remaining === 0) {
        this.deferred.reject(err)
      }
    })
  }
}