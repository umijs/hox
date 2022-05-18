# HoxRoot

最外层增加

```jsx
<HotRoot>
  <App />
</HotRoot>
```

或者单独渲染

```jsx
ReactDOM.render(<HoxRoot />)
```

# createModel -> createGlobalStore

# createModel 的不再支持 Hook 参数

```js
function useCounter(initial) {
  // ...
}
createModel(useCounter, 5)
```

->

```js
function useCounter(initial) {
  // ...
}
createGlobalStore(() => useCounter(5))
```

# useLazyModel

已被移除
