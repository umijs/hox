import { createModel, withModel } from "..";
import * as React from "react";
import { Component, FC, memo, useState } from "react";
import * as testing from "@testing-library/react";

test("simple", function() {
  function useCounter(initialValue: number) {
    const [count, setCount] = useState(initialValue);
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
        <p>{useCounterModel.data.count}</p>
      </div>
    );
  };
  const renderer = testing.render(<App />);
  expect(renderer.asFragment()).toMatchSnapshot();
  testing.fireEvent.click(testing.getByText(renderer.container, "Change"));
  expect(renderer.asFragment()).toMatchSnapshot();
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
