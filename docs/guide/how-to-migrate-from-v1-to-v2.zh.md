# 如何从 v1 迁移到 v2

首先升级 npm 包到 v2，例如：

```shell
npm install --save hox@latest
```

## createModel

`createModel` 在 v2 中对应着 `createGlobalStore`，因此你需要批量把 `createModel` 替换为 `createGlobalStore`：

```js
createModel(() => {
  // ...
})

// ⬇️

createGlobalStore(() => {
  // ...
})
```

同时，`createGlobalStore` 并不支持第二个额外的参数（在之前的 `createModel` 中，这个参数会被传递给 Hook 函数），但是不要担心，你可以直接自己包裹一层匿名函数，来实现同样的效果：

```js
function useCounter(initial) {
  // ...
}
createModel(useCounter, 5)

// ⬇️

function useCounter(initial) {
  // ...
}
createGlobalStore(() => useCounter(5))
```

## HoxRoot

在 v2 版本的 hox 中，需要通过 `HoxRoot` 组件来收集和执行全局 Store，因此你需要在整个应用的最外层包裹一个 `HoxRoot`：

```jsx
<HotRoot>
  <App />
</HotRoot>
```

需要注意的是，在同一个浏览器页面上，**只能同时渲染一个 HoxRoot**。

## useLazyModel

`useLazyModel` 在 hox v2 中已被移除，并且目前没有可等效替代的函数，一般情况下，你可以通过局部 Store 来达到的同样的目的。

## 完成

现在可以启动一下项目试试看看了，如果你按照上面的流程进行操作后，遇到了奇怪的问题，可以来 GitHub 仓库中提交 [issue](https://github.com/umijs/hox/issues)。
