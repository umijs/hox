import {createStore, useStore} from '..'
import * as React from 'react'
import {FC, useState} from 'react'
import * as testing from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

test('simple', function () {
  function useCounter() {
    const [count, setCount] = useState(0)
    const decrement = () => setCount(count - 1)
    const increment = () => setCount(count + 1)
    return {count, decrement, increment}
  }

  const CounterStore = createStore(useCounter)

  const ref = React.createRef<ReturnType<typeof useCounter>>()

  const App: FC = () => {
    const counter = useStore(CounterStore)

    return (
      <div>
        <button onClick={counter.increment}>Change</button>
        <p>{counter.count}</p>
      </div>
    )
  }
  const renderer = testing.render(
    <CounterStore.Provider ref={ref}>
      <App />
    </CounterStore.Provider>
  )
  expect(renderer.asFragment()).toMatchSnapshot()
  testing.fireEvent.click(testing.getByText(renderer.container, 'Change'))
  expect(renderer.asFragment()).toMatchSnapshot()
  expect(ref.current.count).toBe(1)
})

// test("createModel with arg", function() {
//   function useCounter(initalValue: number) {
//     const [count, setCount] = useState(initalValue);
//     const decrement = () => setCount(count - 1);
//     const increment = () => setCount(count + 1);
//     return { count, decrement, increment };
//   }
//
//   const useCounterModel = createModel(useCounter, 5);
//
//   const App: FC = () => {
//     const counter = useCounterModel();
//     return (
//       <div>
//         <button onClick={counter.increment}>Change</button>
//         <p>{counter.count}</p>
//       </div>
//     );
//   };
//   const { getByText, asFragment } = testing.render(<App />);
//   expect(asFragment()).toMatchSnapshot();
//   testing.fireEvent.click(getByText("Change"));
//   expect(asFragment()).toMatchSnapshot();
// });

// test("withModel", function() {
//   function useCounter() {
//     const [count, setCount] = useState(0);
//     const decrement = () => setCount(count - 1);
//     const increment = () => setCount(count + 1);
//     return { count, decrement, increment };
//   }
//
//   const useCounterModel = createModel(useCounter);
//   type Counter = ReturnType<typeof useCounterModel>;
//
//   interface Props {
//     counter: Counter;
//   }
//
//   class App extends Component<Props> {
//     render() {
//       return (
//         <div>
//           <button onClick={this.props.counter.increment}>Change</button>
//           {this.props.counter.count}
//         </div>
//       );
//     }
//   }
//
//   const AppWithModel = withModel(useCounterModel, (counter: Counter) => ({
//     counter
//   }))(App);
//   const renderer = testing.render(<AppWithModel />);
//   expect(renderer.asFragment()).toMatchSnapshot();
//   testing.fireEvent.click(testing.getByText(renderer.container, "Change"));
//   expect(renderer.asFragment()).toMatchSnapshot();
// });
