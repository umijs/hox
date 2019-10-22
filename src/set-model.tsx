import { ModelHook } from "./types";
import { Container } from "./container";
import ReactDOM from "react-dom";
import { Executor } from "./executor";
import React from "react";
import { modelMap } from "./model-map";

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
