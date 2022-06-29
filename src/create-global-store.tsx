import { Container } from './container'
import { registerGlobalExecutor } from './hox-root'
import { useDataFromContainer } from './use-data-from-container'
import { DepsFn } from './types'
import { memo, useEffect, useState } from 'react'

export function createGlobalStore<T>(hook: () => T) {
  let container: Container<T> | null = null
  function getContainer() {
    if (!container) {
      throw new Error(
        'Failed to retrieve data from global container. Please make sure you have rendered HoxRoot.'
      )
    }
    return container
  }

  const GlobalStoreExecutor = memo(() => {
    const [innerContainer] = useState(() => new Container<T>(hook))
    container = innerContainer
    innerContainer.data = hook()
    useEffect(() => {
      innerContainer.notify()
    })
    return null
  })

  registerGlobalExecutor(GlobalStoreExecutor)

  function useGlobalStore(depsFn?: DepsFn<T>): T {
    return useDataFromContainer(getContainer(), depsFn)
  }

  function getGlobalStore(): T | undefined {
    return getContainer().data
  }

  return [useGlobalStore, getGlobalStore] as const
}
