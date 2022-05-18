import React, { ComponentType, FC, NamedExoticComponent } from 'react'
import { NonReactStatics } from 'hoist-non-react-statics'
import { DepsFn } from './types'

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type GetProps<C> = C extends ComponentType<infer P> ? P : never

export type ConnectedComponent<
  C extends ComponentType<any>,
  P
> = NamedExoticComponent<JSX.LibraryManagedAttributes<C, P>> &
  NonReactStatics<C> & {
    WrappedComponent: C
  }

export type Matching<InjectedProps, DecorationTargetProps> = {
  [P in keyof DecorationTargetProps]: P extends keyof InjectedProps
    ? InjectedProps[P] extends DecorationTargetProps[P]
      ? DecorationTargetProps[P]
      : InjectedProps[P]
    : DecorationTargetProps[P]
}

export type Shared<InjectedProps, DecorationTargetProps> = {
  [P in Extract<
    keyof InjectedProps,
    keyof DecorationTargetProps
  >]?: InjectedProps[P] extends DecorationTargetProps[P]
    ? DecorationTargetProps[P]
    : never
}

export type InferableComponentEnhancerWithProps<TInjectedProps, TNeedsProps> = <
  C extends ComponentType<Matching<TInjectedProps, GetProps<C>>>
>(
  component: C
) => ConnectedComponent<
  C,
  Omit<GetProps<C>, keyof Shared<TInjectedProps, GetProps<C>>> & TNeedsProps
>

type MapStoreToProps<TStoreProps, TOwnProps, Store> = (
  store: Store,
  ownProps: TOwnProps
) => TStoreProps

type UseStore<T> = (depsFn?: DepsFn<T>) => T

export function withStore<TStoreProps, TOwnProps, T>(
  useStore: UseStore<T>,
  mapStoreToProps: MapStoreToProps<TStoreProps, TOwnProps, T>
): InferableComponentEnhancerWithProps<TStoreProps, TOwnProps>
export function withStore<TStoreProps, TOwnProps, Store>(
  useStores: UseStore<any>[],
  mapStoreToProps: MapStoreToProps<TStoreProps, TOwnProps, any[]>
): InferableComponentEnhancerWithProps<TStoreProps, TOwnProps>
export function withStore<TStoreProps, TOwnProps>(
  useStoreOrUseStores: UseStore<any> | UseStore<any>[],
  mapStoreToProps: MapStoreToProps<TStoreProps, TOwnProps, any>
) {
  return function (C) {
    const Wrapper: FC<any> = function (props) {
      let storeProps
      if (Array.isArray(useStoreOrUseStores)) {
        const stores = []
        for (const useStore of useStoreOrUseStores) {
          stores.push(useStore())
        }
        storeProps = mapStoreToProps(stores, props)
      } else {
        const store = useStoreOrUseStores()
        storeProps = mapStoreToProps(store, props)
      }
      const componentProps = {
        ...props,
        ...storeProps,
      }
      return <C {...componentProps} />
    }
    Wrapper.displayName = `${C.displayName}Wrapper`
    return Wrapper
  } as InferableComponentEnhancerWithProps<TStoreProps, TOwnProps>
}
