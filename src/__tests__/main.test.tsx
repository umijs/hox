import { setModel, useModel, selectModel } from "..";
import * as React from "react";
import { FC, memo, useState } from "react";
import * as testing from "@testing-library/react";

test("provider initialize", function() {
  function useCounter() {
    const [count, setCount] = useState(0);
    const decrement = () => setCount(count - 1);
    const increment = () => setCount(count + 1);
    return { count, decrement, increment };
  }

  setModel("counter", useCounter);

  const App: FC = props => {
    const counter = useModel("counter");

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
