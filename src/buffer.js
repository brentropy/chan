export class BufferBase {
  constructor (size) {
    this.values = []
    this.size = parseInt(size, 10) || 0
  }

  shift () {
    return this.values.shift()
  }

  hasValues () {
    return this.values.length > 0
  }
}

export class BufferBlocking extends BufferBase {
  push (getValue) {
    if (this.values.length < this.size) {
      this.values.push(getValue())
      return true
    }
    return false
  }
}

export class BufferDropping extends BufferBase {
  push (getValue) {
    const value = getValue()
    if (this.values.length < this.size) {
      this.values.push(value)
    }
    return true
  }
}

export class BufferSliding extends BufferBase {
  push (getValue) {
    this.values.push(getValue())
    if (this.values.length > this.size) {
      this.values.shift()
    }
    return true
  }
}
