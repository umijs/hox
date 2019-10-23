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

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/awmleer/todo-app-with-hox?fontsize=14)

## 安装

```bash
yarn add hox
# 或
npm install --save hox
```

## 快速上手

### 定义 model

在 hox 中，model 就是 custom Hook：

```jsx
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
```

### 注册 model

通过 `setModel` 可以对 model 进行注册：

```jsx
import { setModel } from "hox";
import { useCounter } from "./model";

setModel("counter", useCounter); // 将 useCounter 注册到 'counter' 命名空间下
```

> hox 会为每一个命名空间创建一个容器组件的实例，并在其中执行对应的 custom Hook

### 获取 model

通过 `useModel` 可以获取到指定命名空间下的 model 数据，并订阅其更新：

```jsx
import { useModel } from "hox";

function App(props) {
  const counter = useModel("counter");
  return (
    <div>
      <p>{counter.count}</p>
      <button onClick={counter.increment}>Increment</button>
    </div>
  );
}
```

> 若不希望订阅更新，可以使用 `selectModel`

## 进阶用法

### model 之间的依赖

虽然你仍然可以按照传统的单一数据源的思想进行 model 的设计，但我们更推荐将 model 拆分成多个小部分，于是不可避免的，我们需要在多个 model 之间处理依赖关系，例如订单模块 `order` 依赖账户模块 `account` 。

在 hox 中，处理模块之间的依赖其实非常简单且自然：

在一个 model 中可以直接使用 `useModel` 来获取另一个 model， hox 会将其作为依赖，就像在组件中使用 `useModel` 一样：

```jsx
export function useCounterDouble() {
  const counter = useModel("counter");
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
        <p>{this.props.model.counter.count}</p>
        <button onClick={this.model.counter.increment}>Increment</button>
      </div>
    );
  }
}

export default withModel("counter")(App);
```

### 性能优化

`useModel` 支持传入一个额外的 `depsFn` 函数，来控制是否进行组件的重渲染：

```jsx
const counter = useModel("counter", model => [model.count, model.x.y]);
```

这和 `useMemo` 、 `useEffect` 的 `deps` 非常相似，但是， `useModel` 的 `deps` 参数是一个**函数**。

此外，我们建议对一个庞大的 model 进行拆分，这样不仅代码更易于维护，性能也会有所改善。

## 最佳实践

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/hox-example-tct70)


## API

### setModel

```typescript
function setModel<T>(key: string, model: ModelHook<T>): void;
```

注册一个 model 。

第一个参数为 model 的 `key` ，也可以理解为 namespace ，第二个参数是一个 custom Hook ，用于定义 model 的内部逻辑。

可以多次调用，来创建多个 model ：

```jsx
setModel("counter-a", useCounter);
setModel("counter-b", useCounter);
setModel("timer", useTimer);
```

> `key` 是 model 的唯一标识，所以请保证其唯一性，不要对同一个 `key` 调用多次 `setModel` 。

### useModel

```typescript
function useModel<T extends ModelHook = any>(
  key: string,
  depsFn?: Deps<T>
): ReturnType<T>;
type Deps<T extends ModelHook> = (model: ReturnType<T>) => unknown[];
```

获取并订阅某个 model 的更新。

第一个参数为 model 的 `key` 。第二个参数 `depsFn` 可以缺省，用于[性能优化](#性能优化)。

> `useModel` 是一个 React Hook ，所以在使用它的时候，请遵守 React 的 [rules of hooks](https://reactjs.org/docs/hooks-rules.html) 。

### selectModel

```typescript
function selectModel<T extends ModelHook = any>(key: string): ReturnType<T>;
```

`selectModel` 和 `useModel` 非常类似，他们的区别在于 `selectModel` 只会获取 model 的值，但不会订阅更新。

> `selectModel` 不是一个 React Hook ，你可以在任意地方使用它。

### withModel

```typescript
function withModel(
  keyOrKeys: string | string[],
  mapModelToProps?: (model: ModelMap, ownProps: object) => object;
): (C: ComponentType) => ComponentType
type ModelMap = {
  [key: string]: unknown
}
```

`withModel` 用来在类组件中使用 model ，它的用法类似于 react-redux 中的 connect 。

第一个参数 `keyOrKeys` 用来描述需要获取哪些 model ，可以直接传入一个 `key` ，也可以以数组的形式传入多个。

第二个参数 `mapModelToProps` 用来定义 model 到组件 `props` 的映射规则。这个参数可以缺省，默认的行为是将 `modelMap` 绑到组件的 `model` 属性上。
