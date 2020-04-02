import { ModelHook, UseModel } from "./types";
import { Container } from "./container";
import { Executor } from "./executor";
import React, { useEffect, useRef, useState } from "react";
import { render } from "./renderer";

export function createModel<T>(hook: ModelHook<T>) {
  const container = new Container(hook);
  render(
    <Executor
      onUpdate={val => {
        container.data = val;
        container.notify();
      }}
      hook={hook}
    />
  );
  const useModel: UseModel<T> = depsFn => {
    const [state, setState] = useState<T | undefined>(() =>
      container ? (container.data as T) : undefined
    );
    const depsFnRef = useRef(depsFn);
    depsFnRef.current = depsFn;
    const depsRef = useRef<unknown[]>([]);
    useEffect(() => {
      if (!container) return;
      function subscriber(val: T) {
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
  };
  Object.defineProperty(useModel, "data", {
    get: function() {
      return container.data;
    }
  });
  return useModel;
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
