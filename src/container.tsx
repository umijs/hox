import {StoreHook} from './store'

type Subscriber<T> = (data: T) => void

export class Container<T = unknown> {
  constructor(public hook: StoreHook<T>) {}
  subscribers = new Set<Subscriber<T>>()
  data!: T

  notify() {
    for (const subscriber of this.subscribers) {
      subscriber(this.data)
    }
  }
}
