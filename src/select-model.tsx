import { ModelHook } from "./types";
import { modelMap } from "./model-map";
import { Container } from "./container";

export function selectModel<T extends ModelHook = any>(key: string) {
  type V = ReturnType<T>;
  const container = modelMap.get(key) as Container<V>;
  return container ? (container.data as V) : undefined;
}
