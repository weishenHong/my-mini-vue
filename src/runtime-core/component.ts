import { shallowReadonly } from "../reactivity/index";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode: any) {
  const component: any = {
    setupState: {},
    props: {},
    vnode,
    type: vnode.type,
    emit: () => {},
    slots: {},
  };
  component.emit = emit.bind(null, component);
  return component;
}

export function setupComponent(instance: { vnode: any; type: any }) {
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);

  setupStatefuComponent(instance);
}
function setupStatefuComponent(instance: any) {
  const component = instance.type;

  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
  const { setup } = component;
  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    handleSetupResult(instance, setupResult);
  }
}
function handleSetupResult(instance: { setupState: any }, setupResult: any) {
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const component = instance.type;
  if (component.render) {
    instance.render = component.render;
  }
}
