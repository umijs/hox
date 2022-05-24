type Subscriber<T> = (data: T) => void

export class Container<T = unknown> {
  public initialized: boolean = false
  constructor(public hook: () => T) {}
  subscribers = new Set<Subscriber<T>>()
  data!: T

  notify() {
    for (const subscriber of this.subscribers) {
      subscriber(this.data)
    }
  }
}
