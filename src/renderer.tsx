import ReactReconciler from "react-reconciler";
import { ReactElement } from "react";

const reconciler = ReactReconciler({
  now: Date.now,
  getRootHostContext: () => ({}),
  prepareForCommit: () => ({}),
  resetAfterCommit: () => {},
  getChildHostContext: () => ({}),
  shouldSetTextContent: () => true,
  createInstance: () => {},
  createTextInstance: () => {},
  appendInitialChild: () => {},
  appendChild: () => {},
  finalizeInitialChildren: () => false,
  supportsMutation: true,
  appendChildToContainer: () => {},
  prepareUpdate: () => true,
  commitUpdate: () => {},
  commitTextUpdate: () => {},
  removeChild: () => {},
  clearContainer: () => {},
  supportsPersistence: false,
  getPublicInstance: instance => instance,
  preparePortalMount: () => {},
  isPrimaryRenderer: false,
  supportsHydration: false,
  scheduleTimeout: setTimeout,
  cancelTimeout: id => clearTimeout(id),
  noTimeout: -1
});

export function render(reactElement: ReactElement) {
  const container = reconciler.createContainer(null, 0, false, null);
  return reconciler.updateContainer(reactElement, container);
}
