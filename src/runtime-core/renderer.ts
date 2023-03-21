import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(
  vnode: {
    type: any;
    props: any;
    //
    children: any;
  },
  container: any
) {
  patch(vnode, container);
  //
}

function patch(vnode: any, container: any) {
  // 判断是component还是element
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}
function mountComponent(initinalVNode: any, container: any) {
  const instance = createComponentInstance(initinalVNode);
  setupComponent(instance);
  setupRenderEffect(instance, initinalVNode, container);
}
function setupRenderEffect(instance: any, initinalVNode: any, container: any) {
  const { proxy } = instance;

  const subTree = instance.render.call(proxy);
  patch(subTree, container);
  initinalVNode.el = subTree.el;
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}
function mountElement(vnode: any, container: any) {
  const { type, props, children } = vnode;
  const el = (vnode.el = document.createElement(type));

  // string / array
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el);
  }

  for (const key in props) {
    const value = props[key];
    el.setAttribute(key, value);
  }

  container.append(el);
}
export function mountChildren(vnode: { children: any[] }, container: any) {
  vnode.children.forEach((v: any) => {
    patch(v, container);
  });
}
