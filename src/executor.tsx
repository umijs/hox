import {FC, memo, useEffect} from 'react'
import {StoreHook} from './store'

interface Props {
  storeHook: StoreHook
  onChange: (value: any) => void
  hookProps?: any
}

export const Executor: FC<Props> = props => {
  const hookProps = props.hookProps ?? {}
  const result = props.storeHook(hookProps)
  useEffect(() => {
    props.onChange(result)
  })
  return null
}
