import { Container } from './container'
import { globalContainers } from './hox-root'
import { useDataFromContainer } from './use-data-from-container'
import { DepsFn } from './types'

export interface UseGlobalStore<T> {
  (depsFn?: DepsFn<T>): T
  data?: T
}

export function createGlobalStore<T>(hook: () => T) {
  const container = new Container(hook)
  globalContainers.push(container)
  const useGlobalStore: UseGlobalStore<T> = (depsFn?: DepsFn<T>) => {
    if (!container.initialized) {
      console.error(
        'Failed to retrieve data from global container. Please make sure you have rendered HoxRoot.'
      )
    }
    return useDataFromContainer(container, depsFn)
  }
  Object.defineProperty(useGlobalStore, 'data', {
    get: function () {
      return container.data
    },
  })
  return useGlobalStore
}
