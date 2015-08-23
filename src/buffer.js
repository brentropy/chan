export class BufferBase {
  values = []

  constructor (size) {
    this.size = parseInt(size, 10)
  }

  shift () {
    return this.values.shift()
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
      this.values.unshift()
    }
    return true
  }
}
