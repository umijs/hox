import React, {
  createContext,
  FC,
  memo,
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
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

  const IsolatorContext = createContext({})

  const IsolatorOuter: FC<PropsWithChildren<{}>> = props => {
    return (
      <IsolatorContext.Provider value={{}}>
        {props.children}
      </IsolatorContext.Provider>
    )
  }

  const IsolatorInner = memo<PropsWithChildren<{}>>(
    props => {
      useContext(IsolatorContext)
      return <>{props.children}</>
    },
    () => true
  )

  const StoreExecutor = memo<PropsWithChildren<{}>>(props => {
    const [container] = useState(() => new Container<T>(hook))
    container.data = hook()
    useEffect(() => {
      container.notify()
    })
    return (
      <StoreContext.Provider value={container}>
        {props.children}
      </StoreContext.Provider>
    )
  })

  const StoreProvider: FC<StoreProviderProps> = props => {
    return (
      <IsolatorOuter>
        <StoreExecutor>
          <IsolatorInner>{props.children}</IsolatorInner>
        </StoreExecutor>
      </IsolatorOuter>
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
