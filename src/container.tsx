import { ModelHook } from "./types";

type Subscriber<T> = (data: T) => void;

export class Container<T = unknown> {
  constructor(public hook: ModelHook<T>) {}
  subscribers = new Set<Subscriber<T>>();
  data!: T;

  notify() {
    console.log(this.hook.name, this.data);
    for (const subscriber of this.subscribers) {
      subscriber(this.data);
    }
  }
}
