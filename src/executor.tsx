import { ModelHook } from './types'
import { ReactElement, useLayoutEffect, useRef } from 'react'

export function Executor<T>(props: {
  hook: () => ReturnType<ModelHook<T>>
  onUpdate: (data: T) => void
  onMount: (data: T) => void
}) {
  const data = props.hook()
  const mountedRef = useRef(false)
  if (!mountedRef.current) {
    props.onMount(data)
  }
  useLayoutEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    props.onUpdate(data)
  })
  return null as ReactElement
}
