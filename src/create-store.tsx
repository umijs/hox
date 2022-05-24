import React, {
  createContext,
  FC,
  memo,
  ReactNode,
  useContext,
  useState,
} from 'react'
import { Executor } from './executor'
import { Container } from './container'
import { DepsFn } from './types'
import { useDataFromContainer } from './use-data-from-container'

export type CreateStoreOptions = {
  memo?: boolean
}

type StoreProviderProps = {
  children?: ReactNode
}

const fallbackContainer = new Container<any>(() => {})

export function createStore<T>(hook: () => T, options?: CreateStoreOptions) {
  const shouldMemo = options?.memo ?? true
  // TODO: forwardRef
  const StoreContext = createContext<Container<T>>(fallbackContainer)
  const StoreProvider: FC<StoreProviderProps> = props => {
    const [container] = useState(() => new Container<T>(hook))
    return (
      <>
        <Executor
          hook={hook}
          onUpdate={val => {
            container.data = val
            container.notify()
          }}
          onMount={val => {
            container.data = val
            container.initialized = true
          }}
        />
        {/* TODO: If React can't guarantee the render order, we need to use Checker. Or maybe use Suspense? */}
        <StoreContext.Provider value={container}>
          {props.children}
        </StoreContext.Provider>
      </>
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
