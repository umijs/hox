# 在类组件中使用

虽然 store 是使用的 Hooks 语法，但你仍然可以在类组件中获取和订阅 store，这依赖了 hox 提供的 `withStore` 高阶组件：

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

`withStore` 用来在类组件中使用 store ，它的用法类似于 react-redux 中的 `connect` 。

第一个参数 `useStore` 用来描述需要获取哪些 store ，可以只传入一个 `useStore` ，也可以以数组的形式传入多个。

第二个参数 `mapStoreToProps` 用来定义 store 到组件 `props` 的映射规则。

```typescript
declare function withStore(
  useStore,
  mapStoreToProps: (store, ownProps) => object
): (C: ComponentType) => ComponentType

type StoreMap = {
  [key: string]: unknown
}
```

示例：

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
