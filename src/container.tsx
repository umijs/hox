type Subscriber<T> = (data: T) => void

export class Container<T = unknown> {
  constructor(public data?: T) {}
  subscribers = new Set<Subscriber<T>>()

  notify() {
    for (const subscriber of this.subscribers) {
      subscriber(this.data)
    }
  }
}
