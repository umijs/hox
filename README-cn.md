[English](./README.md) | 简体中文

# hox

> 下一代 React 状态管理器

[![npm version](https://img.shields.io/npm/v/hox.svg?logo=npm)](https://www.npmjs.com/package/hox)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/hox.svg?logo=javascript)](https://www.npmjs.com/package/hox)
![React](https://img.shields.io/npm/dependency-version/hox/peer/react?logo=react)

## 特性

- 只有一个 API，简单高效，几乎无需学习成本
- 使用 custom Hooks 来定义 model，完美拥抱 React Hooks
- 完美的 TypeScript 支持
- 支持多数据源，随用随取

## 在线体验

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/todo-app-with-hox-2gvgg)

## 安装

```bash
yarn add hox
# 或
npm install --save hox
```

## 快速上手

### 创建一个 model

在 hox 中，任意的 custom Hook，经过 `createModel` 包装后，就变成了持久化，且全局共享的数据。

> 注意：作为 model 的 custom Hook 不能接收参数，因为该 Hook 是全局的，不会随着函数每次执行而执行，只会在初始化的时候执行，或者手动触发执行。

```jsx
import { useState } from "react";
import { createModel } from "hox";

function useCounter() {
  const [count, setCount] = useState(0);
  const decrement = () => setCount(count - 1);
  const increment = () => setCount(count + 1);
  return {
    count,
    decrement,
    increment
  };
}

export default createModel(useCounter);
```

> 通过 `createModel` ， hox 会返回一个新的 custom Hook，用来获取 model 的数据。

### 使用 model

还记得刚刚 `createModel` 的返回值吗？在组件中调用这个 Hook ，就可以获取到 model 的数据了。

```jsx
import useCounterModel from "../models/counter";

function App(props) {
  const counter = useCounterModel();
  return (
    <div>
      <p>{counter.count}</p>
      <button onClick={counter.increment}>Increment</button>
    </div>
  );
}
```

`useCounterModel` 是一个真正的 Hook，会订阅数据的更新。也就是说，当点击 "Increment" 按钮时，会触发 counter model 的更新，并且最终通知所有使用 `useCounterModel` 的组件或 Hook。

## 进阶用法

### 给 custom hook 传参

当一个 custom hook 被用于不同的场景下，我们希望它们可以拥有不同的参数。

如下方的例子一样，我们可以通过 `createModel` 的第二个参数，为 custom hook 设置一个参数。这是设置初始值的最佳时机。

```jsx
import { useState } from "react";
import { createModel } from "hox";

function useCounter(initialValue) {
  const [count, setCount] = useState(initialValue ?? 0);
  const decrement = () => setCount(count - 1);
  const increment = () => setCount(count + 1);
  return {
    count,
    decrement,
    increment
  };
}

const useCounterModel = createModel(useCounter);
const useCounterModelWithInitialValue = createModel(useCounter, 20);
```

### model 之间的依赖

虽然你仍然可以按照传统的单一数据源的思想进行 model 的设计，但我们更推荐将 model 拆分成多个小部分，于是不可避免的，我们需要在多个 model 之间处理依赖关系，例如订单模块 `order` 依赖账户模块 `account` 。

在 hox 中，处理模块之间的依赖非常简单且自然：在一个 model 中可以直接使用 `useXXXModel` 来获取另一个 model，并订阅其更新，和在组件中使用并无两样。

> 提醒：小心循环依赖！

```jsx
import { useCounterModel } from "./counter";

export function useCounterDouble() {
  const counter = useCounterModel();
  return {
    ...counter,
    count: counter.count * 2
  };
}
```

### 只读不订阅更新

在某些场景下，我们只希望读取当前 model 的值，而不希望订阅其更新。

如下面的例子一样，我们可以通过 `useCounterModel.data` 来读取当前 model 中值，而不订阅它的更新。

> `useCounterModel.data` 不是一个 Hook，你可以在任何场景中使用它。

```jsx
import { useState } from "react";
import { useCounterModel } from "./counter";

export function logger() {
  const [log, setLog] = useState([]);
  const logCount = () => {
    const counter = useCounterModel.data;
    setLog(log.concat(counter));
  };

  return {
    log,
    logCount
  };
}
```

### 在类组件中使用

虽然 model 是使用的 Hooks 语法，但你仍然可以在类组件中获取和订阅 model ：

```jsx
class App extends Component {
  render() {
    const { counter } = this.props;

    return (
      <div>
        <p>{counter.count}</p>
        <button onClick={counter.increment}>Increment</button>
      </div>
    );
  }
}

export default withModel(useCounterModel, counter => ({
  counter
}))(App);
```

### 性能优化

`createMoldel` 的返回值 `useXxxModel` 支持传入一个 `depsFn` 函数，来精确控制订阅的字段：

```jsx
const counter = useCounterModel(model => [model.count, model.x.y]);
```

这和 `useMemo` 、 `useEffect` 的 `deps` 非常相似，但是， `useModel` 的 `depsFn` 参数是一个**函数**。

此外，我们建议对一个庞大的 model 进行拆分，这样不仅代码更易于维护，性能也会有所改善。

## 最佳实践

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/hox-best-practice-fszmp)

## API

### createModel

```typescript
declare function createModel(hook: ModelHook, hookArg?): UseModel;
```

创建一个 model 。

参数是一个 custom Hook ，用于定义 model 的内部逻辑。

可以多次调用，来创建多个 model ：

```jsx
const useCounterModelA = createModel(useCounter);
const useCounterModelB = createModel(useCounter);
const useTimerModel = createModel(useTimer);
```

也可以通过第二个参数[给 custom hook 传参](#给-custom-hook-传参)。

> 两次调用 `createModel(useCounter)` 会创建 model 的两个实例，彼此相互隔离。

**UseModel**

`UseModel` 是 `createModel` 的返回值类型，它用来获取 model 并订阅其更新。

```typescript
export interface UseModel<T> {
  (depsFn?: (model: T) => unknown[]): T;
  data?: T;
}
```

参数 `depsFn` 可以缺省，用于[性能优化](#性能优化)。

> `useModel` 是一个 React Hook ，所以在使用它的时候，请遵守 React 的 [rules of hooks](https://reactjs.org/docs/hooks-rules.html) 。

此外，`useModel` 上还有一个 `data` 属性，用于一次性地读取 model 的数据，当你想只取值而不订阅更新时，或是试图在非 React 组件的环境中获取 model 时，它会变得非常有用。

### withModel

```typescript
declare function withModel(
  useModel,
  mapModelToProps: (model, ownProps) => object
): (C: ComponentType) => ComponentType;
type ModelMap = {
  [key: string]: unknown;
};
```

`withModel` 用来在类组件中使用 model ，它的用法类似于 react-redux 中的 `connect` 。

第一个参数 `useModel` 用来描述需要获取哪些 model ，可以只传入一个 `useModel` ，也可以以数组的形式传入多个。

第二个参数 `mapModelToProps` 用来定义 model 到组件 `props` 的映射规则。

示例：

```js
// 订阅单个 model
export default withModel(useCounterModel, counter => ({
  count: counter.count
}))(App);

// 订阅多个 model
export default withModel(
  [useCounterModel, useTimerModel],
  ([counter, timer]) => ({
    count: counter.count,
    timer
  })
)(App);
```
