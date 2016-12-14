/**
 * A custom error type used when rejecting the promise for a canceled take.
 */
export class CanceledTakeError extends Error {
  constructor () {
    super()
    const err = Object.create(CanceledTakeError.prototype)
    err.message = 'Pending take from channel was canceled.'
    err.name = 'CanceledTakeError'
    err.stack = this.stack
    return err
  }
}

/**
 * A custom error type used when rejecting the promise for a take when the
 * channel is closed and there are not any values left in the buffer to be
 * taken.
 */
export class ClosedTakeError extends Error {
  constructor () {
    super()
    const err = Object.create(ClosedTakeError.prototype)
    err.message = 'Cannot take a value from an empty closed channel.'
    err.name = 'ClosedTakeError'
    err.stack = this.stack
    return err
  }
}

/**
 * A custom error type used when rejecting the promise for a put when the
 * channel is closed before the value can be put in the buffer.
 */
export class ClosedPutError extends Error {
  constructor () {
    super()
    const err = Object.create(ClosedPutError.prototype)
    err.message = 'Cannot put a value on a closed channel.'
    err.name = 'ClosedPutError'
    err.stack = this.stack
    return err
  }
}
