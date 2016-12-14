import {Queue} from './queue'

export interface IBuffer<T> {
  shift (): T
  hasValues (): boolean
  push (getValue: () => T): boolean
}

abstract class BufferBase<T> implements IBuffer<T> {
  // TODO: Use ring buffer instead of queue
  protected values = new Queue<T>()
  
  constructor (protected size: number) {}

  public shift (): T {
    return this.values.shift()
  }

  public hasValues (): boolean {
    return this.values.empty()
  }

  abstract push (getValue: () => T): boolean
}

export class BufferBlocking<T> extends BufferBase<T> {
  public push (getValue: () => T): boolean {
    if (this.values.size() < this.size) {
      this.values.push(getValue())
      return true
    }
    return false
  }
}

export class BufferDropping<T> extends BufferBase<T> {
  public push (getValue: () => T): boolean {
    const value = getValue()
    if (this.values.size() < this.size) {
      this.values.push(value)
    }
    return true
  }
}

export class BufferSliding<T> extends BufferBase<T> {
  public push (getValue: () => T): boolean {
    this.values.push(getValue())
    if (this.values.size() > this.size) {
      this.values.shift()
    }
    return true
  }
}
