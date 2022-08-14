# Quick Start

## Create a Store

In hox, any custom Hook, after being packaged by `createStore`, becomes a persistent state that can be shared between components.

```jsx
import { useState } from 'react'
import { createStore } from 'hox'

export const [useTaskStore, TaskStoreProvider] = createStore(() => {
  const [tasks, setTasks] = useState([])

  function addTask(task) {
    setTasks(v => [...v, task])
  }

  function finishTask(task) {
    setTasks(v => v.filter(t => t !== task))
  }

  return {
    tasks,
    addTask,
    finishTask,
  }
})
```

`createStore` will return an array with two elements in it, you can deconstruct them through ES6's array destructuring syntax, and take them into names that conform to business logic, such as `useTaskStore` and `TaskStoreProvider` above.

`TaskStoreProvider` is a state container, and its bottom layer depends on the React Context so you need to inject it into the component tree, for example:

```jsx
<App>
  <Header />
  <TaskStoreProvider>
    <TaskList>
      <TaskItem />
      <TaskItem />
      <TaskItem />
    </TaskList>
  </TaskStoreProvider>
</App>
```

Next, you can use `useTaskStore` in the `TaskList` component to subscribe and consume data in the store:

```jsx
function TaskList() {
  const { tasks } = useTaskStore()
  return (
    <>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </>
  )
}
```

Every time the TaskStore is updated, the TaskList will automatically re-render and get the latest `tasks` data.

> `useStore` is a React Hook, so please follow React's [rules of hooks](https://reactjs.org/docs/hooks-rules.html) when using it.

We recommend names like `useXxxStore` and `XxxStoreProvider` because they are more explicit, but if you think they are too long, consider abbreviating them to `useXxx` and `XxxProvider`.

## The Context and Multiple Instances of Store

It should be noted that only the internal nodes of `CounterStoreProvider` can get its context, so `useTaskStore` cannot be called in the `Header` component. If you are familiar with React's Context feature, this is well understood.

```jsx
<App>
  <Header />
  <TaskStoreProvider>
    <TaskList>...</TaskList>
  </TaskStoreProvider>
</App>
```

Each time a `TaskStoreProvider` is rendered, a corresponding store instance will be created. Based on this feature, you can render multiple StoreProviders on the page to achieve multiple instances, and automatically obtain them in the child node components according to the context of the Context To the corresponding store instance:

```jsx
<TaskStoreProvider>
  <TaskList>
    ...
  </TaskList>
</TaskStoreProvider>
<TaskStoreProvider>
  <TaskList>
    ...
  </TaskList>
</TaskStoreProvider>
```

Between different StoreProvider instances, the data is completely independent and isolated, just like multiple instances of the same React component.

You can even render another `TaskStoreProvider` in the `TaskStoreProvider` child node. According to the characteristics of the Context, the `TaskList` component will automatically find the nearest parent Provider:

```jsx
<TaskStoreProvider>
  <TaskList>...</TaskList>
  <TaskStoreProvider>
    <TaskList>...</TaskList>
  </TaskStoreProvider>
</TaskStoreProvider>
```

Of course, this is generally not necessary.

## The Dependencies Between Stores

Although you can still design the store according to the traditional single data source idea, we recommend splitting the store into multiple small parts, so it is inevitable that we need to deal with dependencies between multiple stores, such as tasks The list module `task` depends on the account module `account`.

In hox, handling dependencies between modules is simple and natural: you can use `useXXXStore` directly in one store to fetch another store and subscribe to its updates, just as you would in a component.

> Warning: Beware of circular dependencies!

```jsx
import { useAccountStore } from './account-store'

export const [useTaskStore, TaskStoreProvider] = createStore(() => {
  // ...
  const { user } = useAccountStore()

  function addTask(taskName) {
    setTasks(v => [
      ...v,
      {
        name: taskName,
        assignee: user.id,
      },
    ])
  }

  // ...
})
```

## Pass additional parameters to StoreProvider

You can pass additional parameters to the StoreProvider through `props`, and then in the store's Hook, get it through the first parameter `props`, just like writing React components:

```jsx
<CounterStoreProvider initialCount={42}>{/* ... */}</CounterStoreProvider>
```

```jsx
type Props = {
  initialCount: number,
}

const [useCounterStore, CounterStoreProvider] = createStore(function (
  props: Props
) {
  const [count, setCount] = useState(props.initialCount)
  return { count, setCount }
})
```

## Global Store

In fact, not all stores need to have a scope and need to support multiple instances. In a real project, most stores may be global, and if you manually add StoreProvider every time, you may feel collapse:

```jsx
<AccountStoreProvider>
  <TaskStoreProvider>
    <FooStoreProvider>
      <BarStoreProvider>
        <App />
      </BarStoreProvider>
    </FooStoreProvider>
  </TaskStoreProvider>
</AccountStoreProvider>
```

Therefore, hox provides another type of store: the global store.

You can create a global `store` with `createGlobalStore`:

```js
import { createGlobalStore } from 'hox'

const [useAccountStore, getAccountStore] = createGlobalStore(() => {
  // ...
})
```

Like `createStore`, `createGlobalStore` returns an array:

The first element is the Hook function used to subscribe to the store. Its usage will not be introduced here, it is the same as the ordinary store.

The second element is somewhat different. It is a static getter function `getXxxStore`, which will be sold here first, and will be introduced in detail below.

It can be found that there is no corresponding StoreProvider component for the global store, so you do not need to manually add a layer of Provider every time you create a store. However, in order for the global store to register properly, you need to wrap the entire React application with `HoxRoot` in the outermost layer:

```jsx
import { HoxRoot } from 'hox'

ReactDOM.render(
  <HoxRoot>
    <App />
  </HoxRoot>,
  domContainer
)
```

You can think of `HoxRoot` as a unified StoreProvider for all global stores, through which all global stores can be registered at one time.

Going back to the `getXxxStore` function just mentioned, its function is to read the current latest value of the store at one time without triggering a continuous subscription, because it is not a Hook, so it does not need to be in the React component rendering function call, you can call it anywhere, anytime:

```js
export function log(message) {
  const { user } = getAccountStore()
  report.requestApi({
    message,
    userId: user.id,
  })
}
```
