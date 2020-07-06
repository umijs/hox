import {FC, forwardRef, memo, useEffect, useImperativeHandle} from 'react'
import {StoreHook} from './store'

interface Props {
  storeHook: StoreHook
  onChange: (value: any) => void
  hookProps?: any
}

export const Executor = forwardRef<any, Props>(function Executor(props, ref) {
  const hookProps = props.hookProps ?? {}
  const result = props.storeHook(hookProps)
  useEffect(() => {
    props.onChange(result)
  })
  useImperativeHandle(ref, () => result)
  return null
})
