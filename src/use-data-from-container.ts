import { useEffect, useRef, useState } from 'react'
import { Container } from './container'
import { DepsFn } from './types'

export function useDataFromContainer<T>(
  container: Container<T>,
  depsFn?: DepsFn<T>
) {
  const [state, setState] = useState<T | undefined>(() =>
    container ? container.data : undefined
  )
  const depsFnRef = useRef(depsFn)
  depsFnRef.current = depsFn
  const depsRef = useRef<unknown[]>(depsFnRef.current?.(container.data) || [])

  useEffect(() => {
    if (!container) return

    function subscriber(val: T) {
      if (!depsFnRef.current) {
        setState(val)
      } else {
        const oldDeps = depsRef.current
        const newDeps = depsFnRef.current(val)
        if (compare(oldDeps, newDeps)) {
          setState(val)
        }
        depsRef.current = newDeps
      }
    }

    container.subscribers.add(subscriber)
    if (container.data !== state) {
      setState(container.data)
    }
    return () => {
      container.subscribers.delete(subscriber)
    }
  }, [container])
  return state!
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
