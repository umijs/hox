import {forwardRef, memo, useEffect, useImperativeHandle} from 'react'
import {StoreHook} from './store'

interface Props {
  storeHook: StoreHook
  onChange: (value: any) => void
  hookProps?: any
  memo: boolean
}

export const Executor = memo(
  forwardRef<any, Props>(function Executor(props, ref) {
    const hookProps = props.hookProps ?? {}
    const result = props.storeHook(hookProps)
    useEffect(() => {
      props.onChange(result)
    })
    useImperativeHandle(ref, () => result)
    return null
  }),
  (prevProps: any, nextProps: any) => {
    if (nextProps.memo === false) {
      return false
    }
    for (const key in nextProps.hookProps) {
      if (nextProps.hookProps[key] !== prevProps.hookProps[key]) {
        return false
      }
    }
    return true
  }
)
