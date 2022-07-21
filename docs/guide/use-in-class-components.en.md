# Use in Class Components

Although the store is using the Hooks syntax, you can still get and subscribe to the store in the class component, which relies on the `withStore` higher-order component provided by hox:

```jsx
class App extends Component {
  render() {
    const { counter } = this.props

    return (
      <div>
        <p>{counter.count}</p>
        <button onClick={counter.increment}>Increment</button>
      </div>
    )
  }
}

export default withStore(useCounterStore, counter => ({
  counter,
}))(App)
```

`withStore` is used to use store in class components, its usage is similar to `connect` in react-redux.

The first parameter `useStore` is used to describe which stores need to be obtained. You can pass only one `useStore` or multiple ones in the form of an array.

The second parameter `mapStoreToProps` is used to define the mapping rules from store to component `props`.

```typescript
declare function withStore(
  useStore,
  mapStoreToProps: (store, ownProps) => object
): (C: ComponentType) => ComponentType

type StoreMap = {
  [key: string]: unknown
}
```

Example:

```js
// 订阅单个 store
export default withStore(useCounterStore, counter => ({
  count: counter.count
}))(App)

// 订阅多个 store
export default withStore(
  [useCounterStore, useTimerStore],
  ([counter, timer]) => ({
    count: counter.count,
    timer
  })
)(App)
```
