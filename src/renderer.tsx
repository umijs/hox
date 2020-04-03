import ReactReconciler from "react-reconciler";
import { ReactElement } from "react";

const hostConfig = {
  now: Date.now,
  getRootHostContext: () => ({}),
  prepareForCommit: () => {},
  resetAfterCommit: () => {},
  getChildHostContext: () => ({}),
  shouldSetTextContent: () => true,
  createInstance: () => {},
  createTextInstance: () => {},
  appendInitialChild: () => {},
  appendChild: () => {},
  finalizeInitialChildren: () => {},
  supportsMutation: true,
  appendChildToContainer: () => {},
  prepareUpdate: () => true,
  commitUpdate: () => {},
  commitTextUpdate: () => {},
  removeChild: () => {}
};

const reconciler = ReactReconciler(hostConfig as any);

export function render(reactElement: ReactElement) {
  const container = reconciler.createContainer(null, false, false);
  return reconciler.updateContainer(reactElement, container, null, null);
}
