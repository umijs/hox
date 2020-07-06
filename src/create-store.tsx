import {
  default as React,
  forwardRef,
  PropsWithChildren,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {Container} from './container'
import {defaultStoreValue, Store} from './store'
import {Executor} from './executor'

export function createStore<P = {}, V = unknown>(
  hook: (props: P) => V
): Store<P, V> {
  const Context = React.createContext(new Container<V>(defaultStoreValue))
  const Provider = forwardRef<V, PropsWithChildren<P>>(function (props, ref) {
    const containerRef = useRef<Container<any>>()
    if (!containerRef.current) {
      containerRef.current = new Container<any>(hook)
    }
    const container = containerRef.current

    useImperativeHandle(ref, () => container as any)

    const [initialized, setInitialized] = useState(false)
    function onChange(value: any) {
      if (!initialized) setInitialized(true)
      container.data = value
      container.notify()
    }

    return (
      <Context.Provider value={container}>
        <Executor storeHook={hook} hookProps={props} onChange={onChange} />
        {initialized && props.children}
      </Context.Provider>
    )
  })
  Provider.displayName = 'Provider'
  return {
    Provider,
    Context,
  }
}
