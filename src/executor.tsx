import { useLayoutEffect, useRef } from 'react'

export function Executor<T>(props: {
  hook: () => T
  onUpdate: (data: T) => void
  onMount: (data: T) => void
}) {
  const data = props.hook()
  const mountedRef = useRef(false)
  if (!mountedRef.current) {
    props.onMount(data)
  }
  // TODO: SSR
  useLayoutEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    props.onUpdate(data)
  })
  return null
}
