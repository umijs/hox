import { setModel, useModel, selectModel, withModel } from "..";
import * as React from "react";
import { Component, FC, memo, useState } from "react";
import * as testing from "@testing-library/react";

test("provider initialize", function() {
  function useCounter() {
    const [count, setCount] = useState(0);
    const decrement = () => setCount(count - 1);
    const increment = () => setCount(count + 1);
    return { count, decrement, increment };
  }

  setModel("counter", useCounter);

  const App: FC = () => {
    const counter = useModel<typeof useCounter>("counter");

    return (
      <div>
        <button onClick={counter.increment}>Change</button>
        {counter.count}
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

  setModel("counter", useCounter);

  interface Props {
    counter: ReturnType<typeof useCounter>;
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

  type Counter = ReturnType<typeof useCounter>;

  const AppWithModel = withModel("counter", (model: { counter: Counter }) => ({
    counter: model.counter
  }))(App);
  const renderer = testing.render(<AppWithModel />);
  expect(renderer.asFragment()).toMatchSnapshot();
  testing.fireEvent.click(testing.getByText(renderer.container, "Change"));
  expect(renderer.asFragment()).toMatchSnapshot();
});
