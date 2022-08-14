import { useRef } from 'react'
import { Container } from './container'
import { DepsFn } from './types'
import { useSyncExternalStore } from 'use-sync-external-store/shim'

export function useDataFromContainer<T, P>(
  container: Container<T, P>,
  depsFn?: DepsFn<T>
): T {
  const depsFnRef = useRef(depsFn)
  depsFnRef.current = depsFn
  const depsRef = useRef<unknown[]>(depsFnRef.current?.(container.data) || [])

  return useSyncExternalStore(
    onStoreChange => {
      function subscribe() {
        if (!depsFnRef.current) {
          onStoreChange()
        } else {
          const oldDeps = depsRef.current
          const newDeps = depsFnRef.current(container.data)
          if (compare(oldDeps, newDeps)) {
            onStoreChange()
          }
          depsRef.current = newDeps
        }
      }

      container.subscribers.add(subscribe)
      return () => {
        container.subscribers.delete(subscribe)
      }
    },
    () => container.data
  )
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
