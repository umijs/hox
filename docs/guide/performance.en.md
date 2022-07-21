# Performance

The return value of `createStore` or `createGlobalStore` `useXxxStore` supports passing a `depsFn` function to precisely control the fields of the subscription:

```jsx
const counter = useCounterStore(store => [store.count, store.x.y])
```

This is very similar to the `deps` of `useMemo` and `useEffect`, however, the `depsFn` parameter of `useStore` is a **function**.

Also, we recommend splitting up a huge store so not only will the code be easier to maintain, but performance will also improve.
