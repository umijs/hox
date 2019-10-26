English | [简体中文](./README-cn.md)

# hox

> The next-generation state manager for React.

[![npm version](https://img.shields.io/npm/v/hox.svg?logo=npm)](https://www.npmjs.com/package/hox)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/hox.svg?logo=javascript)](https://www.npmjs.com/package/hox)
![React](https://img.shields.io/npm/dependency-version/hox/peer/react?logo=react)

## Features

- Only one API, simple and efficient. Almost no learning cost.
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

> Attention: The custom Hook you pass to `createModel` can not have parameters.

```jsx
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

> By calling `createModel`, hox will return a new custom Hook, which is used for retrieving model data.

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
import { useState } from "React";
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

In order to control the data you want to subscribe precisely, you can pass an odditional `depsFn` function to `useXxxModel`.

```jsx
const counter = useModel("counter", model => [model.count, model.x.y]);
```

This is very similiar to the `deps` parameter of `useMemo` or `useEffect` . But remember, the `depsFn` of `useModel` is a **function** .

In addition, we recommend splitting a large model into small parts, so that not only is the code easier to maintain, but performance can also get improved.

## Best Practices

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/hox-best-practice-fszmp)

## API

### setModel

```typescript
function setModel<T>(key: string, model: ModelHook<T>): void;
```

Register a model.

The first parameter is the `key` of model (aka namespace) . And the second parameter is a custom Hook, used for defining the logic of model.

You can call `setModel` multiple times to create multiple models:

```jsx
setModel("counter-a", useCounter);
setModel("counter-b", useCounter);
setModel("timer", useTimer);
```

> `key` is the unique identifier of model. So please make sure it is **unique**. Don't call `setModel` multiple times on the same `key`.

### useModel

```typescript
function useModel<T extends ModelHook = any>(
  key: string,
  depsFn?: Deps<T>
): ReturnType<T>;
type Deps<T extends ModelHook> = (model: ReturnType<T>) => unknown[];
```

Retrieve one model and subscribe to its updates.

The first parameter is the `key` of model. And the second is `depsFn` which can be omitted. It is used for [performance optimization](#performance-optimization).

> `useModel` is a React Hook, so please follow React's [rules of hooks](https://reactjs.org/docs/hooks-rules.html).

### selectModel

```typescript
function selectModel<T extends ModelHook = any>(key: string): ReturnType<T>;
```

`selectModel` is very similiar to `useModel`. The key difference is that `selectModel` only retrieves the value, but doesn't subscribe to its updates.

> `selectModel` is not a React Hook, so you can use it anywhere.

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

`withModel` is the bridge between models and class components. If you have ever used react-redux's `connect` before, you'll find it very familiar.

The first parameter `keyOrKeys` describes which models need to be obtained. You can just pass one `key`, or multiple keys in the form of array.

The second parameter `mapModelToProps` is used to define the mapping rule from model to component `props`. This parameter can be omitted and the default behavior is binding the `modelMap` to the `model` prop of the component.
