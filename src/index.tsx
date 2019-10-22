import ReactDOM from "react-dom";
import React, {
  ComponentType,
  FC,
  useDebugValue,
  useEffect,
  useRef,
  useState,
  ReactElement,
  NamedExoticComponent
} from "react";
import { NonReactStatics } from "hoist-non-react-statics";

type ModelHook<T = any> = () => T;

const modelMap = new Map<string, Container<any>>();

type Subscriber<T> = (data: T) => void;

class Container<T = unknown> {
  constructor(public hook: ModelHook<T>) {}
  subscribers = new Set<Subscriber<T>>();
  data!: T;

  notify() {
    console.log(this.hook.name, this.data);
    for (const subscriber of this.subscribers) {
      subscriber(this.data);
    }
  }
}

function Executor<T>(props: {
  hook: ModelHook<T>;
  onUpdate: (data: T) => void;
}) {
  const data = props.hook();
  props.onUpdate(data);
  return null as ReactElement;
}

export function setModel<T>(key: string, model: ModelHook<T>) {
  const element = document.createElement("div");
  const container = new Container(model);
  modelMap.set(key, container);
  ReactDOM.render(
    <Executor
      onUpdate={val => {
        container.data = val;
        container.notify();
      }}
      hook={model}
    />,
    element
  );
}

type Deps<T extends ModelHook> = (model: ReturnType<T>) => unknown[];

export function useModel<T extends ModelHook = any>(
  key: string,
  depsFn?: Deps<T>
) {
  type V = ReturnType<T>;
  useDebugValue(key);
  const container = modelMap.get(key) as Container<V>;
  const [state, setState] = useState<V | undefined>(() =>
    container ? (container.data as V) : undefined
  );
  const depsFnRef = useRef<Deps<V>>();
  depsFnRef.current = depsFn;
  const depsRef = useRef<unknown[]>([]);
  useEffect(() => {
    if (!container) return;
    function subscriber(val: V) {
      if (!depsFnRef.current) {
        setState(val);
      } else {
        const oldDeps = depsRef.current;
        const newDeps = depsFnRef.current(val);
        if (compare(oldDeps, newDeps)) {
          setState(val);
        }
        depsRef.current = newDeps;
      }
    }
    container.subscribers.add(subscriber);
    return () => {
      container.subscribers.delete(subscriber);
    };
  }, [container]);
  return state!;
}

export function selectModel<T extends ModelHook = any>(key: string) {
  type V = ReturnType<T>;
  const container = modelMap.get(key) as Container<V>;
  return container ? (container.data as V) : undefined;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type GetProps<C> = C extends ComponentType<infer P> ? P : never;

export type ConnectedComponent<
  C extends ComponentType<any>,
  P
> = NamedExoticComponent<JSX.LibraryManagedAttributes<C, P>> &
  NonReactStatics<C> & {
    WrappedComponent: C;
  };

export type Matching<InjectedProps, DecorationTargetProps> = {
  [P in keyof DecorationTargetProps]: P extends keyof InjectedProps
    ? InjectedProps[P] extends DecorationTargetProps[P]
      ? DecorationTargetProps[P]
      : InjectedProps[P]
    : DecorationTargetProps[P];
};

export type Shared<InjectedProps, DecorationTargetProps> = {
  [P in Extract<
    keyof InjectedProps,
    keyof DecorationTargetProps
  >]?: InjectedProps[P] extends DecorationTargetProps[P]
    ? DecorationTargetProps[P]
    : never;
};

export type InferableComponentEnhancerWithProps<TInjectedProps, TNeedsProps> = <
  C extends ComponentType<Matching<TInjectedProps, GetProps<C>>>
>(
  component: C
) => ConnectedComponent<
  C,
  Omit<GetProps<C>, keyof Shared<TInjectedProps, GetProps<C>>> & TNeedsProps
>;

export interface WithModelProps {
  model: {
    [key: string]: unknown;
  };
}

type MapModelToProps<TModelProps, TOwnProps, Model> = (
  model: Model,
  ownProps: TOwnProps
) => TModelProps;

export function withModel<TModelProps, TOwnProps, Model>(
  key: string,
  mapModelToProps?: MapModelToProps<TModelProps, TOwnProps, Model>
): InferableComponentEnhancerWithProps<TModelProps, TOwnProps>;
export function withModel<TModelProps, TOwnProps, Model>(
  keys: string[],
  mapModelToProps?: MapModelToProps<TModelProps, TOwnProps, Model>
): InferableComponentEnhancerWithProps<TModelProps, TOwnProps>;
export function withModel<TModelProps, TOwnProps, Model>(
  keyOrKeys: string | string[],
  mapModelToProps: MapModelToProps<TModelProps, TOwnProps, Model>
) {
  return function(C) {
    const Wrapper: FC<any> = function(props) {
      const model: {
        [key: string]: unknown;
      } = {};
      if (Array.isArray(keyOrKeys)) {
        for (const key of keyOrKeys) {
          model[key] = useModel(key);
        }
      } else {
        model[keyOrKeys] = useModel(keyOrKeys);
      }
      const modelProps = mapModelToProps
        ? mapModelToProps((model as unknown) as Model, props)
        : { model };
      const componentProps = {
        ...props,
        ...modelProps
      };
      return <C {...componentProps} />;
    };
    Wrapper.displayName = `${C.displayName}Wrapper`;
    return Wrapper;
  } as InferableComponentEnhancerWithProps<TModelProps, TOwnProps>;
}

function compare(oldDeps: unknown[], newDeps: unknown[]) {
  if (oldDeps.length !== newDeps.length) {
    return true;
  }
  for (const index in newDeps) {
    if (oldDeps[index] !== newDeps[index]) {
      return true;
    }
  }
  return false;
}
