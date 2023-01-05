import React, {
  createContext,
  FC,
  memo,
  PropsWithChildren,
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

const fallbackContainer = new Container<any>(() => {})

export function createStore<T, P = {}>(
  hook: (props: P) => T,
  options?: CreateStoreOptions
) {
  const shouldMemo = options?.memo ?? true
  // TODO: forwardRef
  const StoreContext = createContext<Container<T, P>>(fallbackContainer)

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
    }
  )

  const StoreExecutor = memo<PropsWithChildren<P>>(props => {
    const { children, ...p } = props
    const [container] = useState(() => new Container<T, P>(hook))
    container.data = hook(p as P)
    useEffect(() => {
      container.notify()
    })
    return (
      <StoreContext.Provider value={container}>
        {props.children}
      </StoreContext.Provider>
    )
  })

  const StoreProvider: FC<PropsWithChildren<P>> = props => {
    return (
      <IsolatorOuter>
        <StoreExecutor {...props}>
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
