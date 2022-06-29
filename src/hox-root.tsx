import React, { ComponentType, FC, PropsWithChildren } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'

let globalExecutors: ComponentType[] = []

const listeners = new Set<() => void>()

export function registerGlobalExecutor(executor: ComponentType) {
  globalExecutors = [...globalExecutors, executor]
  listeners.forEach(listener => listener())
}

export const HoxRoot: FC<PropsWithChildren<{}>> = props => {
  const executors = useSyncExternalStore(
    onStoreChange => {
      listeners.add(onStoreChange)
      return () => {
        listeners.delete(onStoreChange)
      }
    },
    () => {
      return globalExecutors
    }
  )
  return (
    <>
      {executors.map((Executor, index) => (
        <Executor key={index} />
      ))}
      {props.children}
    </>
  )
}
