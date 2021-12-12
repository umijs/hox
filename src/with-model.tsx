import React, { ComponentType, FC, NamedExoticComponent } from "react";
import { NonReactStatics } from "hoist-non-react-statics";
import { UseModel, Config } from "./types";

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

type MapModelToProps<TModelProps, TOwnProps, Model> = (
  model: Model,
  ownProps: TOwnProps
) => TModelProps;

export function withModel<TModelProps, TOwnProps, T>(
  useModel: UseModel<T>,
  mapModelToProps: MapModelToProps<TModelProps, TOwnProps, T>,
  config: Config
): InferableComponentEnhancerWithProps<TModelProps, TOwnProps>;
export function withModel<TModelProps, TOwnProps, Model>(
  useModels: UseModel<any>[],
  mapModelToProps: MapModelToProps<TModelProps, TOwnProps, any[]>,
  config: Config
): InferableComponentEnhancerWithProps<TModelProps, TOwnProps>;
export function withModel<TModelProps, TOwnProps>(
  useModelOrUseModels: UseModel<any> | UseModel<any>[],
  mapModelToProps: MapModelToProps<TModelProps, TOwnProps, any>,
  config: Config = { forwardRef: true }
) {
  return function(C) {
    const Wrapper: FC<any> = function(props) {
      let modelProps;
      if (Array.isArray(useModelOrUseModels)) {
        const models = [];
        for (const useModel of useModelOrUseModels) {
          models.push(useModel());
        }
        modelProps = mapModelToProps(models, props);
      } else {
        const model = useModelOrUseModels();
        modelProps = mapModelToProps(model, props);
      }
      const componentProps = {
        ...props,
        ...modelProps,
        ...{
          ref: config.forwardRef ? props.onRef : undefined
        }
      };
      return <C {...componentProps} />;
    };
    Wrapper.displayName = `${C.displayName}Wrapper`;
    return Wrapper;
  } as InferableComponentEnhancerWithProps<TModelProps, TOwnProps>;
}
