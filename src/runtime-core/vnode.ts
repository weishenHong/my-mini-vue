import { shapeFlags } from "../shared/shapeFlags";

export function createVNode(type: any, props?: any, children?: any) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    el: null,
  };
  if (typeof children === "string") {
    // vnode.shapeFlag = vnode.shapeFlag | shapeFlags.TEXT_CHILDREN  简化后 ↓
    vnode.shapeFlag |= shapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= shapeFlags.ARRAY_CHILDREN;
  }
  return vnode;
}
function getShapeFlag(type: any) {
  return typeof type === "string"
    ? shapeFlags.ELEMENT
    : shapeFlags.STATEFUL_COMPONENT;
}
