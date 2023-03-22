import { isObject } from "../shared/index";
import { shapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, TEXT } from "./vnode";

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
  const { type, shapeFlag } = vnode;

  switch (type) {
    case Fragment:
      processFragment(vnode, container);
      break;

    case TEXT:
      processText(vnode, container);
      break;
    default:
      // 判断是component还是element
      if (shapeFlag & shapeFlags.ELEMENT) {
        processElement(vnode, container);
      } else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
      }
      break;
  }
}

function processText(vnode: any, container: any) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}

function processFragment(vnode: any, container: any) {
  mountChildren(vnode, container);
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
  const { type, props, children, shapeFlag } = vnode;
  const el = (vnode.el = document.createElement(type));

  // string / array
  if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el);
  }

  for (const key in props) {
    const value = props[key];
    const isOn = (key: string) => {
      return /^on[A-Z]/.test(key);
    };
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, value);
    } else {
      el.setAttribute(key, value);
    }
  }

  container.append(el);
}
export function mountChildren(vnode: { children: any[] }, container: any) {
  vnode.children.forEach((v: any) => {
    patch(v, container);
  });
}
