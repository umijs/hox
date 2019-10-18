# hox

[![npm version](https://img.shields.io/npm/v/hox.svg?logo=npm)](https://www.npmjs.com/package/hox)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/hox.svg?logo=javascript)](https://www.npmjs.com/package/hox)
![React](https://img.shields.io/npm/dependency-version/hox/peer/react?logo=react)

使用 hooks 构建 React 应用的模型层。

## 特性

- 支持全部的 React hooks，一个 custom hook 就是一个 model
- 可定义多个 model，随用随取
- 简单高效，几乎无需学习成本

## 安装

```bash
yarn add hox
# 或
npm install --save hox
```

## 快速上手

### 定义 model

在 hox 中，model 本质上就是 custom hook：

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

> hox 会为每一个命名空间创建一个容器组件的实例，并在其中执行对应的 custom hook

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

### model 之间的依赖

在一个 model 中也可以使用 `useModel`， hox 会将其作为依赖：

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

### 在类组件中使用

虽然 model 是使用的 hooks 语法，但你仍然可以在类组件中获取和订阅 model ：

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
