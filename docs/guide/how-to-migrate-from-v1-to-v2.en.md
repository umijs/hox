# How to migrate from v1 to v2

First upgrade the npm package to v2, for example:

```shell
npm install --save hox@latest
```

##createModel

`createModel` corresponds to `createGlobalStore` in v2, so you need to batch replace `createModel` with `createGlobalStore`:

```js
createModel(() => {
  // ...
})

// ⬇️

createGlobalStore(() => {
  // ...
})
```

At the same time, `createGlobalStore` does not support the second extra parameter (in the previous `createModel`, this parameter will be passed to the Hook function), but don't worry, you can directly wrap a layer of anonymous function to achieve the same Effect:

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

In the v2 version of hox, the global Store needs to be collected and executed through the `HoxRoot` component, so you need to wrap a `HoxRoot` in the outermost layer of the entire application:

```jsx
<HoxRoot>
  <App />
</HoxRoot>
```

It should be noted that on the same browser page, only one HoxRoot can be rendered at the same time.

## useLazyModel

`useLazyModel` has been removed in hox v2, and there is currently no equivalent function, in general, you can achieve the same purpose with a local Store.

## Finish

Now you can start the project and try it out. If you encounter strange problems after following the above process, you can submit [issue](https://github.com/umijs/hox/issues) in the GitHub repository .
