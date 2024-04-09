import React, {
  createContext,
  FC,
  Fragment,
  memo,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Container } from './container'
import { DepsFn } from './types'
import { useDataFromContainer } from './use-data-from-container'

export type CreateStoreOptions = {
  memo?: boolean
}

const fallbackContainer = new Container<any>(() => {})

export function createStore<T, P extends {} = {}>(
  hook: (props: P) => T,
  options?: CreateStoreOptions
) {
  const shouldMemo = options?.memo ?? true
  const StoreContext = createContext<Container<T, P>>(fallbackContainer)
  const StoreExecutor = memo<
    PropsWithChildren<{ container: Container<T, P>; p: P }>
  >(({ container, p }) => {
    container.data = hook(p as P)
    useEffect(() => {
      container.notify()
    })
    return null
  })

  const StoreProvider: FC<PropsWithChildren<P>> = ({ children, ...p }) => {
    const container = useRef(new Container<T, P>(hook))
    return (
      <Fragment>
        <StoreExecutor container={container.current} p={p as P} />
        <StoreContext.Provider value={container.current}>
          {children}
        </StoreContext.Provider>
      </Fragment>
    )
  }

  function useStore(depsFn?: DepsFn<T>): T {
    const container = useContext(StoreContext)
    if (container === fallbackContainer) {
      // TODO
      console.error(
        "Failed to retrieve the store data from context. Seems like you didn't render a outer StoreProvider."
      )
    }
    return useDataFromContainer(container, depsFn)
  }

  return [useStore, shouldMemo ? memo(StoreProvider) : StoreProvider] as const
}
