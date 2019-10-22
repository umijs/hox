import { useDebugValue, useEffect, useRef, useState } from "react";
import { ModelHook } from "./types";
import { modelMap } from "./model-map";
import { Container } from "./container";

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
