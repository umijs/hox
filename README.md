English | [简体中文](./README-cn.md)
# hox

> The next-generation state manager for React.

[![npm version](https://img.shields.io/npm/v/hox.svg?logo=npm)](https://www.npmjs.com/package/hox)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/hox.svg?logo=javascript)](https://www.npmjs.com/package/hox)
![React](https://img.shields.io/npm/dependency-version/hox/peer/react?logo=react)

## Features

- Define model with custom Hooks
- Supports multiple data sources
- Simple and efficient. Almost no learning cost.

## Try It Online

[![Edit](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/todo-app-with-hox-2gvgg)

## Install

```bash
yarn add hox
# Or
npm install --save hox
```

## Quick Start

### Define model

In hox, a model is just a custom Hook:

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

### Register model

You can register your model to a global namespace with `setModel` :

```jsx
import { setModel } from "hox";
import { useCounter } from "./model";

setModel("counter", useCounter); // register useCounter to the 'counter' namespace
```

> Hox will create a stand-alone container for each of the namespaces and execute the corresponding custom Hook in it.

### Retrieve model

With `useModel` , you can retrieve the model data of the given namespace, and subscribe to its updates at the same time:

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

> If you don't want to subscribe to the updates, you can use `selectModel` .

## Advanced Usages

### Dependencies between models

Although you can still design your model according to the traditional single data source pattern, we recommend splitting the big model into small parts. Therefore inevitably, we need to handle dependencies between multiple models. For example, the `order` model depends on the `account` model.

In hox, handling these depdencies is actually quite simple and straightforward:

In one model, you can just use `useModel` to retrieve another model. Hox will regard it as a denpendency, just like using `useModel` in normal React components:

```jsx
export function useCounterDouble() {
  const counter = useModel("counter");
  return {
    ...counter,
    count: counter.count * 2
  };
}
```

When the dependency model updates, hox will trigger the rerendering of the dependent model. And finally, this update will spread to components.

> Caution: Be careful with circular dependencies!

### How to use hox in class components

Of course, we use Hooks to define our models, but you can still retrieve and subscribe to models in class components:

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

### Performance optimization

In order to control the rerender of components, you can pass an odditional `depsFn` function to `useModel`.

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
