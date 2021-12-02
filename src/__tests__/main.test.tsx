import { createModel, withModel } from "..";
import * as React from "react";
import { Component, FC, useEffect, useState } from "react";
import * as testing from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { act } from "react-dom/test-utils";
import { usePersistFn } from "ahooks";
import { createLazyModel } from "../create-model";

function sleep(duration: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

test("simple", function() {
  function useCounter() {
    const [count, setCount] = useState(0);
    const decrement = () => setCount(count - 1);
    const increment = () => setCount(count + 1);
    return { count, decrement, increment };
  }

  const useCounterModel = createModel(useCounter);

  const App: FC = () => {
    const counter = useCounterModel();

    return (
      <div>
        <button onClick={counter.increment}>Change</button>
        <p>{counter.count}</p>
        <p>{useCounterModel.data.count}</p>
      </div>
    );
  };
  const renderer = testing.render(<App />);
  expect(renderer.asFragment()).toMatchSnapshot();
  testing.fireEvent.click(testing.getByText(renderer.container, "Change"));
  expect(renderer.asFragment()).toMatchSnapshot();
});

test("createModel with arg", function() {
  function useCounter(initalValue: number) {
    const [count, setCount] = useState(initalValue);
    const decrement = () => setCount(count - 1);
    const increment = () => setCount(count + 1);
    return { count, decrement, increment };
  }

  const useCounterModel = createModel(useCounter, 5);

  const App: FC = () => {
    const counter = useCounterModel();
    return (
      <div>
        <button onClick={counter.increment}>Change</button>
        <p>{counter.count}</p>
      </div>
    );
  };
  const { getByText, asFragment } = testing.render(<App />);
  expect(asFragment()).toMatchSnapshot();
  testing.fireEvent.click(getByText("Change"));
  expect(asFragment()).toMatchSnapshot();
});

test("withModel", function() {
  function useCounter() {
    const [count, setCount] = useState(0);
    const decrement = () => setCount(count - 1);
    const increment = () => setCount(count + 1);
    return { count, decrement, increment };
  }

  const useCounterModel = createModel(useCounter);
  type Counter = ReturnType<typeof useCounterModel>;

  interface Props {
    counter: Counter;
  }

  class App extends Component<Props> {
    render() {
      return (
        <div>
          <button onClick={this.props.counter.increment}>Change</button>
          {this.props.counter.count}
        </div>
      );
    }
  }

  const AppWithModel = withModel(useCounterModel, (counter: Counter) => ({
    counter
  }))(App);
  const renderer = testing.render(<AppWithModel />);
  expect(renderer.asFragment()).toMatchSnapshot();
  testing.fireEvent.click(testing.getByText(renderer.container, "Change"));
  expect(renderer.asFragment()).toMatchSnapshot();
});

test("setState timing", async function() {
  function useCounter() {
    const [count, setCount] = useState(0);
    function change() {
      setCount(1);
    }
    return { count, change };
  }

  const useCounterModel = createModel(useCounter);

  const App: FC = () => {
    const counter = useCounterModel();
    useEffect(() => {
      act(() => {
        useCounterModel.data.change();
      });
    }, []);
    return (
      <div>
        <p>{counter.count}</p>
      </div>
    );
  };

  const renderer = testing.render(<App />);

  expect(renderer.asFragment()).toMatchSnapshot();
});

test("async state update", async function() {
  function useCounter() {
    const [count, setCount] = useState(0);
    const increment = () => setCount(count + 1);
    const asyncUpdate = usePersistFn(() => {
      sleep(100).then(() => {
        setCount(2);
      });
    });
    useEffect(() => {
      if (count === 1) {
        asyncUpdate();
      }
    }, [count]);
    return { count, increment };
  }

  const useCounterModel = createModel(useCounter);

  const App: FC = () => {
    const counter = useCounterModel();

    return (
      <div>
        <button onClick={counter.increment}>Change</button>
        <p>{counter.count}</p>
        <p>{useCounterModel.data.count}</p>
      </div>
    );
  };
  const renderer = testing.render(<App />);
  expect(renderer.asFragment()).toMatchSnapshot();
  await act(async () => {
    testing.fireEvent.click(testing.getByText(renderer.container, "Change"));
    await sleep(150);
  });
  expect(renderer.asFragment()).toMatchSnapshot();
});

test("create lazy model", async function() {
  function useCounter() {
    const [count, setCount] = useState(0);
    const decrement = () => setCount(count - 1);
    const increment = () => setCount(count + 1);
    return { count, decrement, increment };
  }

  const useCounterModel = createLazyModel(useCounter);

  const App: FC = () => {
    const counter = useCounterModel();

    return (
      <div>
        <button onClick={counter.increment}>Change</button>
        <p>{counter.count}</p>
        <p>{useCounterModel.data.count}</p>
      </div>
    );
  };
  expect(useCounterModel.data).toBeUndefined();
  const renderer = testing.render(<App />);
  expect(useCounterModel.data).toBeDefined();
  expect(renderer.asFragment()).toMatchSnapshot();
  act(() => {
    testing.fireEvent.click(testing.getByText(renderer.container, "Change"));
  });
  expect(renderer.asFragment()).toMatchSnapshot();
});

test("depsFn", function() {
  function useCounter() {
    const [obj, setObj] = useState({
      a: 1,
      b: 2
    });
    const addA = () =>
      setObj({
        ...obj,
        a: obj.a + 1
      });

    return { obj, addA };
  }
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  const useCounterModel = createModel(useCounter);

  const App1: FC = () => {
    const counter = useCounterModel();
    fn1();

    return <button onClick={counter.addA}>Change</button>;
  };
  const App2: FC = () => {
    const counter = useCounterModel(data => [data.obj.b]);
    fn2();

    return <button>{counter.obj.b}</button>;
  };

  const { getByText } = testing.render(<App1 />);
  testing.render(<App2 />);
  expect(fn1).toBeCalledTimes(1);
  expect(fn2).toBeCalledTimes(1);

  testing.fireEvent.click(getByText("Change"));
  expect(fn1).toBeCalledTimes(2);
  expect(fn2).toBeCalledTimes(1);
});

test("depending", async () => {
  const useCounterModel = createModel(function A() {
    const [count, setCount] = useState(0);
    const increment = () => setCount(count + 1);

    return {
      count,
      increment
    };
  });

  const useCounterModel2 = createModel(function B() {
    console.log("useCounterModel");
    const counterModel = useCounterModel();
    const [count, setCount] = useState(counterModel.count || 1);
    const increment = () => setCount(count + 1);

    return {
      count,
      increment
    };
  });

  const App: FC = () => {
    const counterModel = useCounterModel();
    const counterModel2 = useCounterModel2();

    return (
      <>
        {counterModel.count} | {counterModel2.count}
        <button onClick={counterModel.increment}>increment</button>
      </>
    );
  };

  const renderer = testing.render(<App />);
  expect(renderer.asFragment()).toMatchSnapshot();
  act(() => {
    testing.fireEvent.click(renderer.getByText("increment"));
  });
  await sleep(10);
  expect(renderer.asFragment()).toMatchSnapshot();
});
