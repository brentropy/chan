import {equal, ok} from 'assert'
import * as sinon from 'sinon'
import {describe, it, beforeEach, afterEach} from 'mocha'
import {CanceledTakeError, ClosedTakeError, ClosedPutError} from './error'

describe.only('Errors', () => {
  function errorTests (ErrorClass, name) {
    describe(name, () => {
      let error

      beforeEach(() => {
        error = new ErrorClass()
      })

      it('is an instance of Error', () => {
        ok(error instanceof Error)
      })

      it('is an instance of its own class', () => {
        ok(error instanceof ErrorClass)
      })

      it('has a stack trace', () => {
        ok(/beforeEach/.test(error.stack))
      })

      it('has the correct name', () => {
        equal(error.name, name)
      })
    })
  }

  errorTests(CanceledTakeError, 'CanceledTakeError')
  errorTests(ClosedTakeError, 'ClosedTakeError')
  errorTests(ClosedPutError, 'ClosedPutError')
})
