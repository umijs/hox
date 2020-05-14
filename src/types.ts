export type ModelHook<T = any, P = any> = (hookProps: P) => T;

type Deps<T> = (model: T) => unknown[];
export interface UseModel<T> {
  (depsFn?: Deps<T>): T;
  data?: T;
}
