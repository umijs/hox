import {
  Context,
  ForwardRefExoticComponent,
  PropsWithChildren,
  PropsWithoutRef,
  RefAttributes,
  RefObject,
} from 'react'
import {Container} from './container'

export type Store<P = {}, V = unknown> = {
  Provider: ForwardRefExoticComponent<
    PropsWithoutRef<PropsWithChildren<P>> & RefAttributes<V>
  >
  Context: Context<Container<V>>
}

export type StoreHook<P = {}, V = unknown> = (props: P) => V

export type StoreP<S extends Store> = S extends Store<infer P, any> ? P : never
export type StoreV<S extends Store> = S extends Store<any, infer V> ? V : never

export const defaultStoreValue = Symbol() as any
