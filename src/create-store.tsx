import {
  default as React,
  forwardRef,
  memo,
  PropsWithChildren,
  useRef,
  useState,
} from 'react'
import {Container} from './container'
import {defaultStoreValue, Store} from './store'
import {Executor} from './executor'

interface Options {
  memo?: boolean
}

export function createStore<P = {}, V = unknown>(
  hook: (props: P) => V,
  options?: Options
): Store<P, V> {
  const Context = React.createContext(new Container<V>(defaultStoreValue))
  let Provider = forwardRef<V, PropsWithChildren<P>>(function (props, ref) {
    const containerRef = useRef<Container<V>>()
    if (!containerRef.current) {
      containerRef.current = new Container<V>(hook)
    }
    const container = containerRef.current

    const [initialized, setInitialized] = useState(false)
    function onChange(value: any) {
      if (!initialized) setInitialized(true)
      container.data = value
      container.notify()
    }

    return (
      <Context.Provider value={container}>
        <Executor
          storeHook={hook}
          hookProps={props}
          onChange={onChange}
          ref={ref}
        />
        {initialized && props.children}
      </Context.Provider>
    )
  })
  if (hook.name) {
    Provider.displayName = `HoxProvider(${hook.name})`
  } else {
    Provider.displayName = 'HoxProvider'
  }
  if (options?.memo) {
    Provider = memo(Provider)
  }
  return {
    Provider,
    Context,
  }
}
