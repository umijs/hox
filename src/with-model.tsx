import React, { ComponentType, FC, NamedExoticComponent } from "react";
import { NonReactStatics } from "hoist-non-react-statics";
import { useModel } from "./index";

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
