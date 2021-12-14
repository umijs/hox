English | [简体中文](./README-cn.md)

# hox

> The next-generation state manager for React.

[![npm version](https://img.shields.io/npm/v/hox.svg?logo=npm)](https://www.npmjs.com/package/hox)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/hox.svg?logo=javascript)](https://www.npmjs.com/package/hox)
![React](https://img.shields.io/npm/dependency-version/hox/peer/react?logo=react)

## Features

- Just one API, simple and efficient. Almost no learning cost.
- Define model with custom Hooks.
- Perfect typescript support.
- Supports multiple data sources.

## Try It Online

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/todo-app-with-hox-2gvgg)

## Install

```bash
yarn add hox
# Or
npm install --save hox
```

## Quick Start

### Create a model

In hox, you can process a custom Hook with `createModel` to make it persistent and globally shared.

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

> By calling `createModel`, hox will return a new custom Hook, which is used for retrieving model data. Furthermore, we can [pass values to custom hooks](#Pass-values-to-custom-hooks) to the second parameter of createModels for custom hooks.

## Use model

In order to retrieve the data of counter model, you need to import and call `useCounterModel` in your components.

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

`useCounterModel` is a real Hook. By calling it, you can subscribe to the updates of data. So if you click the "Increment" button, the update of counter model will be triggered, and finally, hox will notify all components or Hooks using `useCounterModel`.

## Advanced Usages

### Pass values to custom hooks

In some scenarios, we might want to pass values to custom hooks.

Just like the example below, we could pass a value to the second parameter of createModel for the custom hook. This is the best time to set the initial value for `useState`, etc.

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

### Dependencies between models

Although you can still design your model according to the traditional single data source pattern, we recommend splitting the big model into small parts. Therefore inevitably, we need to handle dependencies between multiple models. For example, the `order` model depends on the `account` model.

In hox, handling these depdencies is actually quite simple and straightforward: You can call `useXxxModel` to retrieve another model and subscribe its updates. Just like what you can do in components.

> Caution: Be careful with circular dependencies!

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

### Readonly

In some scenarios, we only want to read the current value of a model, without subscribing to its updates.

Just like the example below, we can read the current value of counter model from `useCounterModel.data`.

> `useCounterModel.data` is not Hook, you can use it anywhere.

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

### How to use hox in class components

Of course, we use Hooks to define our models, but you can still retrieve and subscribe to models in class components:

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

### Performance optimization

In order to control the data you want to subscribe precisely, you can pass an additional `depsFn` function to `useXxxModel`.

```jsx
const counter = useCounterModel(model => [model.count, model.x.y]);
```

This is very similiar to the `deps` parameter of `useMemo` or `useEffect` . But remember, the `depsFn` of `useModel` is a **function** .

In addition, we recommend splitting a large model into small parts, so that not only is the code easier to maintain, but performance can also get improved.

## Best Practices

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/hox-best-practice-fszmp)

## API

### createModel

```typescript
declare function createModel(hook: ModelHook, hookArg?): UseModel;
```

Create a model.

The parameter is a custom Hook, used for defining the logic of model.

You can call it multiple times to create multiple models:

```jsx
const useCounterModelA = createModel(useCounter);
const useCounterModelB = createModel(useCounter);
const useTimerModel = createModel(useTimer);
```

You can also [pass values to custom hooks](#Pass-values-to-custom-hooks) to the second parameter of createModels for custom hooks.

> Calling `createModel(useCounter)` two times will create two instances which are isolated from each other.

**UseModel**

`UseModel` is the return type of `createModel`. It is used for retrieving model and subscribing to its updates.

```typescript
export interface UseModel<T> {
  (depsFn?: (model: T) => unknown[]): T;
  data?: T;
}
```

The parameter `depsFn` can be omitted. And it is used for [performance optimization](#performance-optimization).

> `useModel` is a React Hook, so please follow React's [rules of hooks](https://reactjs.org/docs/hooks-rules.html).

What's more, there is `data` field on `useModel`, which is used for reading the current value of the model. You'll find it quite useful when you try to just read the value without subscribing to its updates, or try to use model in none-react environments.

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

`withModel` is the bridge between models and class components. If you have ever used react-redux's `connect` before, you'll find it very familiar.

The first parameter `useModel` describes which models need to be obtained. You can just pass one `useModel`, or multiple in the form of array.

The second parameter `mapModelToProps` is used to define the mapping rule from model to component `props`.

For example:

```js
// subscibe to a single model
export default withModel(useCounterModel, counter => ({
  count: counter.count
}))(App);

// subscribe to multiple models
export default withModel(
  [useCounterModel, useTimerModel],
  ([counter, timer]) => ({
    count: counter.count,
    timer
  })
)(App);
```
