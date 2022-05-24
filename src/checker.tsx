import React, {
  forwardRef,
  PropsWithChildren,
  useImperativeHandle,
  useState,
} from 'react'
import { Container } from './container'

interface CheckRef {
  onInitialize: () => void
}

export const Checker = forwardRef<
  CheckRef,
  PropsWithChildren<{
    container: Container<any>
  }>
>((props, ref) => {
  const [initialized, setInitialized] = useState(props.container.initialized)

  useImperativeHandle(ref, () => ({
    onInitialize: () => {
      setInitialized(true)
    },
  }))

  return <>{initialized && props.children}</>
})

Checker.displayName = 'Checker'
