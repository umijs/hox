import React, { FC } from 'react'
import { Container } from './container'
import { Executor } from './executor'

// This list can only be pushed. Shift, unshift, pop, slice, etc are forbidden.
export const globalContainers: Container<any>[] = []

export const HoxRoot: FC = props => {
  return (
    <>
      {/* TODO: memoize Executors */}
      {globalContainers.map((container, index) => (
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
