import {equal, ok} from 'assert'
import * as sinon from 'sinon'
import {describe, it, beforeEach, afterEach} from 'mocha'
import {blockingChannel, slidingChannel, droppingChannel} from './factory'
import * as bufferModule from './buffer'
import * as channelModule from './channel'

describe('Factory functions', () => {
  let channel
  let channelStub
  let buffer
  let bufferStub

  beforeEach(() => {
    channel = {}
    buffer = {}
    channelStub = sinon.stub(channelModule, 'Channel').returns(channel)
  })

  afterEach(() => {
    channelStub.restore()
  })

  function testFactory (factory, bufferType, defaultSize) {
    describe(factory.name, () => {
      beforeEach(() => {
        bufferStub = sinon.stub(bufferModule, bufferType).returns(buffer)
      })

      afterEach(() => {
        bufferStub.restore()
      })

      it('constructs a new buffer with size', () => {
        const size = 5
        factory(size)
        sinon.assert.calledWithExactly(bufferStub, size)
      })

      if (defaultSize != null) {
        it(`has a default buffer size of ${defaultSize}`, () => {
          factory()
          sinon.assert.calledWithExactly(bufferStub, defaultSize)
        })
      }

      it('constructs a new channel with buffer', () => {
        factory()
        sinon.assert.calledWithExactly(channelStub, buffer)
      })

      it('returns the new channel', () => {
        equal(factory(), channel)
      })
    })
  }

  testFactory(blockingChannel, 'BufferBlocking', 0)
  testFactory(slidingChannel, 'BufferSliding', null)
  testFactory(blockingChannel, 'BufferBlocking', null)
})
