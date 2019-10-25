# hox

> 下一代 React 状态管理器

[![npm version](https://img.shields.io/npm/v/hox.svg?logo=npm)](https://www.npmjs.com/package/hox)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/hox.svg?logo=javascript)](https://www.npmjs.com/package/hox)
![React](https://img.shields.io/npm/dependency-version/hox/peer/react?logo=react)

## 特性

- 使用 custom Hooks 来定义 model
- 支持多数据源，随用随取
- 简单高效，几乎无需学习成本

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

在 hox 中，你可以通过 custom Hook 来定义 model ，然后使用 `createModel` 把它变成一个全局共享的数据模型。

```jsx
import { createModel } from 'hox';

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

export export const useCounterModel = createModel(useCounter)
```

> 通过 `createModel` ， hox 会创建一个全局的容器组件，在其中执行对应的 custom Hook ，并返回一个用来获取数据的 Hook 。

### 获取 model

还记得刚刚 `createModel` 返回的 `useCounterModel` 吗？在组件中调用这个 Hook ，就可以获取到 model 的数据了。

```jsx
import { useCounterModel } from "../models/counter";

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

同时， `useCounterModel` 还会订阅数据的更新，也就是说，当点击 "Increment" 按钮时，会触发 counter model 的更新，并且最终通知 `App` 组件进行重渲染。

## 进阶用法

### model 之间的依赖

虽然你仍然可以按照传统的单一数据源的思想进行 model 的设计，但我们更推荐将 model 拆分成多个小部分，于是不可避免的，我们需要在多个 model 之间处理依赖关系，例如订单模块 `order` 依赖账户模块 `account` 。

在 hox 中，处理模块之间的依赖其实非常简单且自然：

在一个 model 中可以直接使用 `useXXXModel` 来获取另一个 model， hox 会将其作为依赖，就像在组件中使用 `useXXXModel` 一样：

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

当依赖更新时，也会触发 model 的重渲染，并最终将更新传递到组件。

> 提醒：小心循环依赖！

### 在类组件中使用

虽然 model 是使用的 Hooks 语法，但你仍然可以在类组件中获取和订阅 model ：

```jsx
class App extends Component {
  render() {
    return (
      <div>
        <p>{this.props.counter.count}</p>
        <button onClick={this.props.counter.increment}>Increment</button>
      </div>
    );
  }
}

export default withModel(useCounterModel, counter => ({
  counter
}))(App);
```

### 性能优化

`useModel` 支持传入一个 `depsFn` 函数，来控制是否进行组件的重渲染：

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
declare function createModel(hook: ModelHook): UseModel;
```

创建一个 model 。

参数是一个 custom Hook ，用于定义 model 的内部逻辑。

可以多次调用，来创建多个 model ：

```jsx
const useCounterModelA = createModel(useCounter);
const useCounterModelB = createModel(useCounter);
const useTimerModel = createModel(useTimer);
```

> 两次调用 `createModel(useCounter)` 会创建 model 的两个实例，彼此相互隔离。

### useModel

`UseModel` 是 `createModel` 的返回值类型。

```typescript
export interface UseModel<T> {
  (depsFn?: (model: T) => unknown[]): T;
  data?: T;
}
```

获取 model 并订阅其更新。

参数 `depsFn` 可以缺省，用于[性能优化](#性能优化)。

> `useModel` 是一个 React Hook ，所以在使用它的时候，请遵守 React 的 [rules of hooks](https://reactjs.org/docs/hooks-rules.html) 。

此外，`useModel` 上还有一个 `data` 属性，用于一次性地读取 model 的数据，当你想只取值而不订阅更新时，或是试图在非 React 组件的环境中获取 model 时，它会变得非常有用。

### withModel

```typescript
declare function withModel(
  useModel,
  mapModelToProps?: (model, ownProps) => object
): (C: ComponentType) => ComponentType;
type ModelMap = {
  [key: string]: unknown;
};
```

`withModel` 用来在类组件中使用 model ，它的用法类似于 react-redux 中的 `connect` 。

第一个参数 `useModel` 用来描述需要获取哪些 model ，可以只传入一个 `UseModel` ，也可以以数组的形式传入多个。

第二个参数 `mapModelToProps` 用来定义 model 到组件 `props` 的映射规则。这个参数可以缺省，默认的行为是将 `modelMap` 绑到组件的 `model` 属性上。

示例：

```js
// 订阅单个 model
export default withModel(useCounterModel, (counter) => ({
  count: counter.count
}))(App)

// 订阅多个 model
export default withModel([useCounterModel, useTimerModel], ([counter, timer]) => ({
  count: counter.count,
  timer,
}))(App)
```
