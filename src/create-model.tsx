import { ModelHook, UseModel } from "./types";
import { Container } from "./container";
import { Executor } from "./executor";
import React, { useEffect, useRef, useState } from "react";
import { render } from "./renderer";
import { useAction } from "use-action";

export function createModel<T, P>(hook: ModelHook<T, P>, hookArg?: P) {
  const container = new Container(hook);
  render(
    <Executor
      onUpdate={val => {
        container.data = val;
        container.notify();
      }}
      hook={() => hook(hookArg)}
    />
  );
  const useModel: UseModel<T> = depsFn => {
    const [state, setState] = useState<T | undefined>(() =>
      container ? (container.data as T) : undefined
    );
    const depsFnRef = useRef(depsFn);
    depsFnRef.current = depsFn;
    const depsRef = useRef<unknown[]>([]);
    useAction(() => {
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

export function createLazyModel<T, P>(hook: ModelHook<T, P>, hookArg?: P) {
  let useModel: UseModel<T>;
  const useLazyModel: UseModel<T> = depsFn => {
    if (!useModel) {
      useModel = createModel(hook, hookArg);
    }
    return useModel(depsFn);
  };
  Object.defineProperty(useLazyModel, "data", {
    get: function() {
      return useModel.data;
    }
  });
  return useLazyModel;
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
