import { shapeFlags } from "../shared/shapeFlags";
export const Fragment = Symbol("Fragment");
export const TEXT = Symbol("TEXT");
export function createVNode(type: any, props?: any, children?: any) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    key: props?.key,
    el: null,
  };
  if (typeof children === "string") {
    // vnode.shapeFlag = vnode.shapeFlag | shapeFlags.TEXT_CHILDREN  简化后 ↓
    vnode.shapeFlag |= shapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= shapeFlags.ARRAY_CHILDREN;
  }

  if (vnode.shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlag |= shapeFlags.SLOT_CHILDREN;
    }
  }
  return vnode;
}
export function createTextVNode(text: string) {
  return createVNode(TEXT, {}, text);
}
function getShapeFlag(type: any) {
  return typeof type === "string"
    ? shapeFlags.ELEMENT
    : shapeFlags.STATEFUL_COMPONENT;
}
