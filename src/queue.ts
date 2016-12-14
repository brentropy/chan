// TODO: implement proper queue with O(1) push and shift
// Array based queue has O(n) shifts
export class Queue<T> {
  private items: Array<T> = []

  public push (value: T): void {
    this.items.push(value)
  }

  public shift (): T {
    return this.items.shift();
  }

  public size (): number {
    return this.items.length
  }

  public empty (): boolean {
    return this.size() === 0
  }

  public notEmpty (): boolean {
    return this.size() > 0
  }
  
  public remove (value: T): boolean {
    const idx = this.items.indexOf(value)
    if (idx > -1) {
      this.items.splice(idx, 1)
      return true
    }
    return false
  }
}