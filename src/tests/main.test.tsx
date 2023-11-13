import { createGlobalStore, createStore, HoxRoot, withStore } from '..'
import * as React from 'react'
import { Component, FC, ReactElement, useEffect, useState } from 'react'
import * as testing from '@testing-library/react'
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'
import { useMemoizedFn } from 'ahooks'

function sleep(duration: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve()
    }, duration)
  })
}

test('simple', function () {
  function useCounter() {
    const [count, setCount] = useState(0)
    const decrement = () => setCount(count - 1)
    const increment = () => setCount(count + 1)
    return { count, decrement, increment }
  }

  const [useCounterStore, CounterStoreProvider] = createStore(useCounter)

  const App: FC = () => {
    const counter = useCounterStore()

    return (
      <div>
        <button onClick={counter.increment} data-testid='change-button'>
          Change
        </button>
        <p>{counter.count}</p>
      </div>
    )
  }
  const renderer = testing.render(
    <CounterStoreProvider>
      <App />
    </CounterStoreProvider>
  )
  expect(renderer.asFragment()).toMatchSnapshot()
  testing.fireEvent.click(renderer.getByTestId('change-button'))
  expect(renderer.asFragment()).toMatchSnapshot()
})

test('children should not have redundant renders', function () {
  function useCounter() {
    const [count, setCount] = useState(0)
    const decrement = () => setCount(count - 1)
    const increment = () => setCount(count + 1)
    return { count, decrement, increment }
  }

  const [useCounterStore, CounterStoreProvider] = createStore(useCounter)

  const childRender = jest.fn()

  const Child: FC = () => {
    const counter = useCounterStore()
    childRender()
    return (
      <div>
        <button onClick={counter.increment} data-testid='change-button'>
          Change
        </button>
        <p>{counter.count}</p>
      </div>
    )
  }

  const App: FC = () => {
    const [flag, setFlag] = useState({})
    return (
      <CounterStoreProvider>
        <button
          onClick={() => {
            setFlag({})
          }}
          data-testid='parent-button'
        />
        <Child />
      </CounterStoreProvider>
    )
  }
  const renderer = testing.render(<App />)
  expect(renderer.asFragment()).toMatchSnapshot()
  expect(childRender).toHaveBeenCalledTimes(1)
  testing.fireEvent.click(renderer.getByTestId('parent-button'))
  expect(childRender).toHaveBeenCalledTimes(2)
  testing.fireEvent.click(renderer.getByTestId('change-button'))
  expect(renderer.asFragment()).toMatchSnapshot()
})

test('createGlobalStore with arg', function () {
  function useCounter(initalValue: number) {
    const [count, setCount] = useState(initalValue)
    const decrement = () => setCount(count - 1)
    const increment = () => setCount(count + 1)
    return { count, decrement, increment }
  }

  const [useCounterModel] = createGlobalStore(() => useCounter(5))

  const App: FC = () => {
    const counter = useCounterModel()
    return (
      <div>
        <button onClick={counter.increment}>Change</button>
        <p>{counter.count}</p>
      </div>
    )
  }
  const { getByText, asFragment } = testing.render(
    <HoxRoot>
      <App />
    </HoxRoot>
  )
  expect(asFragment()).toMatchSnapshot()
  testing.fireEvent.click(getByText('Change'))
  expect(asFragment()).toMatchSnapshot()
})

test('call createGlobalStore after HoxRoot get mounted', function () {
  function useCounter() {
    const [count, setCount] = useState(0)
    const decrement = () => setCount(count - 1)
    const increment = () => setCount(count + 1)
    return { count, decrement, increment }
  }

  let appElement: ReactElement

  const AppWrapper: FC = props => {
    const [enable, setEnable] = useState(false)
    return (
      <>
        <button
          onClick={() => {
            setEnable(true)
          }}
        >
          Enable
        </button>
        {enable && appElement}
      </>
    )
  }

  const { getByText, asFragment } = testing.render(
    <HoxRoot>
      <AppWrapper />
    </HoxRoot>
  )

  expect(asFragment()).toMatchSnapshot()

  const [useCounterModel] = createGlobalStore(useCounter)
  const App: FC = () => {
    const counter = useCounterModel()
    return (
      <div>
        <button onClick={counter.increment}>Change</button>
        <p>{counter.count}</p>
      </div>
    )
  }
  appElement = <App />

  testing.fireEvent.click(getByText('Enable'))
  expect(asFragment()).toMatchSnapshot()
  testing.fireEvent.click(getByText('Change'))
  expect(asFragment()).toMatchSnapshot()
})

test('withStore', function () {
  function useCounter() {
    const [count, setCount] = useState(0)
    const decrement = () => setCount(count - 1)
    const increment = () => setCount(count + 1)
    return { count, decrement, increment }
  }

  const [useCounterStore] = createGlobalStore(useCounter)
  type Counter = ReturnType<typeof useCounterStore>

  interface Props {
    counter: Counter
  }

  class App extends Component<Props> {
    render() {
      return (
        <div>
          <button onClick={this.props.counter.increment}>Change</button>
          {this.props.counter.count}
        </div>
      )
    }
  }

  const AppWithStore = withStore(useCounterStore, (counter: Counter) => ({
    counter,
  }))(App)
  const renderer = testing.render(
    <HoxRoot>
      <AppWithStore />
    </HoxRoot>
  )
  expect(renderer.asFragment()).toMatchSnapshot()
  testing.fireEvent.click(testing.getByText(renderer.container, 'Change'))
  expect(renderer.asFragment()).toMatchSnapshot()
})

test('setState timing', async function () {
  function useCounter() {
    const [count, setCount] = useState(0)

    function change() {
      setCount(1)
    }

    return { count, change }
  }

  const [useCounterModel, getCounterStore] = createGlobalStore(useCounter)

  const App: FC = () => {
    const counter = useCounterModel()
    useEffect(() => {
      getCounterStore()?.change()
    }, [])
    return (
      <div>
        <p>{counter.count}</p>
      </div>
    )
  }

  const renderer = testing.render(
    <HoxRoot>
      <App />
    </HoxRoot>
  )

  expect(renderer.asFragment()).toMatchSnapshot()
})

test('async state update', async function () {
  function useCounter() {
    const [count, setCount] = useState(0)
    const increment = () => setCount(count + 1)
    const asyncUpdate = useMemoizedFn(() => {
      sleep(100).then(() => {
        setCount(2)
      })
    })
    useEffect(() => {
      if (count === 1) {
        asyncUpdate()
      }
    }, [count])
    return { count, increment }
  }

  const [useCounterStore, getCounterStore] = createGlobalStore(useCounter)

  const App: FC = () => {
    const counter = useCounterStore()

    return (
      <div>
        <button onClick={counter.increment}>Change</button>
        <p>{counter.count}</p>
        <p>{getCounterStore()?.count}</p>
      </div>
    )
  }
  const renderer = testing.render(
    <HoxRoot>
      <App />
    </HoxRoot>
  )
  expect(renderer.asFragment()).toMatchSnapshot()
  await act(async () => {
    testing.fireEvent.click(testing.getByText(renderer.container, 'Change'))
  })
  await sleep(200)
  expect(renderer.asFragment()).toMatchSnapshot()
})

// test('create lazy model', async function () {
//   function useCounter() {
//     const [count, setCount] = useState(0)
//     const decrement = () => setCount(count - 1)
//     const increment = () => setCount(count + 1)
//     return { count, decrement, increment }
//   }
//
//   const useCounterModel = createLazyModel(useCounter)
//
//   const App: FC = () => {
//     const counter = useCounterModel()
//
//     return (
//       <div>
//         <button onClick={counter.increment}>Change</button>
//         <p>{counter.count}</p>
//         <p>{useCounterModel.data.count}</p>
//       </div>
//     )
//   }
//   expect(useCounterModel.data).toBeUndefined()
//   const renderer = testing.render(<HoxRoot><App /></HoxRoot>)
//   expect(useCounterModel.data).toBeDefined()
//   expect(renderer.asFragment()).toMatchSnapshot()
//   act(() => {
//     testing.fireEvent.click(testing.getByText(renderer.container, 'Change'))
//   })
//   expect(renderer.asFragment()).toMatchSnapshot()
// })

test('depsFn', function () {
  function useCounter() {
    const [obj, setObj] = useState({
      a: 1,
      b: 2,
    })
    const addA = () =>
      setObj({
        ...obj,
        a: obj.a + 1,
      })

    return { obj, addA }
  }

  const fn1 = jest.fn()
  const fn2 = jest.fn()
  const [useCounterModel] = createGlobalStore(useCounter)

  const App1: FC = () => {
    const counter = useCounterModel()
    fn1()

    return <button onClick={counter.addA}>Change</button>
  }
  const App2: FC = () => {
    const counter = useCounterModel(data => [data.obj.b])
    fn2()

    return <button>{counter.obj.b}</button>
  }

  const { getByText } = testing.render(
    <HoxRoot>
      <App1 />
    </HoxRoot>
  )
  testing.render(
    <HoxRoot>
      <App2 />
    </HoxRoot>
  )
  expect(fn1).toBeCalledTimes(1)
  expect(fn2).toBeCalledTimes(1)

  testing.fireEvent.click(getByText('Change'))
  expect(fn1).toBeCalledTimes(2)
  expect(fn2).toBeCalledTimes(1)
})

test('depending', async () => {
  const [useCounterModel] = createGlobalStore(function A() {
    const [count, setCount] = useState(0)
    const increment = () => setCount(count + 1)

    return {
      count,
      increment,
    }
  })

  const [useCounterModel2] = createGlobalStore(function B() {
    const counterModel = useCounterModel()
    const [count, setCount] = useState(counterModel.count || 1)
    const increment = () => setCount(count + 1)

    return {
      count,
      increment,
    }
  })

  const App: FC = () => {
    const counterModel = useCounterModel()
    const counterModel2 = useCounterModel2()

    return (
      <>
        {counterModel.count} | {counterModel2.count}
        <button onClick={counterModel.increment}>increment</button>
      </>
    )
  }

  const renderer = testing.render(
    <HoxRoot>
      <App />
    </HoxRoot>
  )
  expect(renderer.asFragment()).toMatchSnapshot()
  act(() => {
    testing.fireEvent.click(renderer.getByText('increment'))
  })
  await sleep(10)
  expect(renderer.asFragment()).toMatchSnapshot()
})

test('parent child', async () => {
  const [useCounterModel] = createGlobalStore(function A() {
    const [count, setCount] = useState(0)
    const increment = () => setCount(count + 1)

    return {
      count,
      increment,
    }
  })

  const Child: FC = () => {
    const counter = useCounterModel()
    useEffect(() => {
      counter.increment()
    }, [])
    return <div>{counter.count}</div>
  }

  const App: FC = () => {
    const counterModel = useCounterModel()
    return (
      <>
        {counterModel.count}
        <Child />
      </>
    )
  }

  const renderer = testing.render(
    <HoxRoot>
      <App />
    </HoxRoot>
  )
  expect(renderer.asFragment()).toMatchSnapshot()
})

test('with extra props passed in', function () {
  function useCounter(props: { count: number }) {
    return { count: props.count }
  }

  const [useCounterStore, CounterStoreProvider] = createStore(useCounter)

  const App: FC = () => {
    const [count, setCount] = useState(0)
    const increment = () => setCount(count + 1)

    return (
      <CounterStoreProvider count={count}>
        <button onClick={increment} data-testid='change-button'>
          Change
        </button>
        <Inner />
      </CounterStoreProvider>
    )
  }

  const Inner: FC = () => {
    const counter = useCounterStore()
    return <p>{counter.count}</p>
  }

  const renderer = testing.render(<App />)
  expect(renderer.asFragment()).toMatchSnapshot()
  testing.fireEvent.click(renderer.getByTestId('change-button'))
  expect(renderer.asFragment()).toMatchSnapshot()
})

test('children should update', function () {
  const [useEmptyStore, EmptyStoreProvider] = createStore(function (props: {}) {
    return {}
  })

  const Child: FC<{ counter: number }> = props => {
    return <div>{props.counter}</div>
  }

  const App: FC = () => {
    const [counter, setCounter] = useState(0)
    return (
      <div>
        <button
          onClick={() => {
            setCounter(counter + 1)
          }}
          data-testid='change-button'
        >
          Change
        </button>
        <EmptyStoreProvider>
          <Child counter={counter} />
        </EmptyStoreProvider>
      </div>
    )
  }
  const renderer = testing.render(<App />)
  expect(renderer.asFragment()).toMatchSnapshot()
  testing.fireEvent.click(renderer.getByTestId('change-button'))
  expect(renderer.asFragment()).toMatchSnapshot()
})
