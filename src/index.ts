import {Channel} from './channel'
import {blockingChannel, slidingChannel, droppingChannel} from './factory'
import {select, Selector} from './select'
import {timeout} from './timeout'

export = Object.assign(blockingChannel, {
  sliding: slidingChannel,
  dropping: droppingChannel,
  Channel,
  timeout,
  select,
  Selector
})
