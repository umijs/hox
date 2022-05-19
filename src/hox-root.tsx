import React, { FC, PropsWithChildren } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { Container } from './container'
import { Executor } from './executor'

let globalContainers: Container<any>[] = []

const listeners = new Set<() => void>()

export function registerGlobalContainer(container: Container<any>) {
  globalContainers = [...globalContainers, container]
  listeners.forEach(listener => listener())
}

export const HoxRoot: FC<PropsWithChildren<{}>> = props => {
  const containers = useSyncExternalStore(
    onStoreChange => {
      listeners.add(onStoreChange)
      return () => {
        listeners.delete(onStoreChange)
      }
    },
    () => {
      return globalContainers
    }
  )
  return (
    <>
      {/* TODO: memoize Executors */}
      {containers.map((container, index) => (
        <Executor
          key={index}
          hook={container.hook}
          onUpdate={val => {
            container.data = val
            container.notify()
          }}
          onMount={val => {
            container.data = val
            container.initialized = true
          }}
        />
      ))}
      {props.children}
    </>
  )
}
