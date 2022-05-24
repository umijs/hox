import { Container } from './container'
import { registerGlobalContainer } from './hox-root'
import { useDataFromContainer } from './use-data-from-container'
import { DepsFn } from './types'

export function createGlobalStore<T>(hook: () => T) {
  const container = new Container(hook)
  registerGlobalContainer(container)
  function useGlobalStore(depsFn?: DepsFn<T>): T {
    if (!container.initialized) {
      console.error(
        'Failed to retrieve data from global container. Please make sure you have rendered HoxRoot.'
      )
    }
    return useDataFromContainer(container, depsFn)
  }
  function getGlobalStore(): T | undefined {
    return container.data
  }
  return [useGlobalStore, getGlobalStore] as const
}
