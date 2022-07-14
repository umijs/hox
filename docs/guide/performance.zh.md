# 性能优化

`createStore` 或 `createGlobalStore` 的返回值 `useXxxStore` 支持传入一个 `depsFn` 函数，来精确控制订阅的字段：

```jsx
const counter = useCounterStore(store => [store.count, store.x.y])
```

这和 `useMemo` 、 `useEffect` 的 `deps` 非常相似，但是， `useStore` 的 `depsFn` 参数是一个**函数**。

此外，我们建议对一个庞大的 store 进行拆分，这样不仅代码更易于维护，性能也会有所改善。
