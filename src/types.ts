export type ModelHook<T = any> = () => T;

type Deps<T> = (model: T) => unknown[];
export interface UseModel<T> {
  (depsFn?: Deps<T>): T;
  data?: T;
}
