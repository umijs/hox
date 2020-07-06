import {defaultStoreValue, Store, StoreV} from './store'
import {NoStoreError} from './error'
import {useContext, useEffect, useRef, useState} from 'react'

type Deps<V> = (value: V) => unknown[]

export function useStore<S extends Store<any, any>>(
  s: S,
  deps?: Deps<StoreV<S>>
) {
  // const name = s.displayName || s.name
  // useDebugValue(name)
  const Context = s.Context
  const container = useContext(Context)

  const [state, setState] = useState<StoreV<S>>(container.data)

  const depsRef = useRef<unknown[]>([])

  useEffect(() => {
    const subscriber = () => {
      if (!deps) {
        setState(container.data)
      } else {
        const oldDeps = depsRef.current
        const newDeps = deps(container.data)
        if (compare(oldDeps, newDeps)) {
          setState(container.data)
        }
        depsRef.current = newDeps
      }
    }
    container.subscribers.add(subscriber)
    return () => {
      container.subscribers.delete(subscriber)
    }
  }, [])

  if (state === defaultStoreValue) {
    throw new NoStoreError(
      `No store context of "${name}" found. And "${name}" doesn't have defaultValue. Either render a Provider or set a defaultValue for this Store.`,
      s
    )
  }

  return state
}

function compare(oldDeps: unknown[], newDeps: unknown[]) {
  if (oldDeps.length !== newDeps.length) {
    return true
  }
  for (const index in newDeps) {
    if (oldDeps[index] !== newDeps[index]) {
      return true
    }
  }
  return false
}
