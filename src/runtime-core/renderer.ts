import { shapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, TEXT } from "./vnode";
export function createRenderer(options: any) {
  const {
    createElement: hostCreateElement,
    patchProps: hostPatchProps,
    insert: hostInsert,
  } = options;
  function render(
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

  function patch(vnode: any, container: any, parentComponent: any = null) {
    const { type, shapeFlag } = vnode;

    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent);
        break;

      case TEXT:
        processText(vnode, container);
        break;
      default:
        // 判断是component还是element
        if (shapeFlag & shapeFlags.ELEMENT) {
          processElement(vnode, container, parentComponent);
        } else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentComponent);
        }
        break;
    }
  }

  function processText(vnode: any, container: any) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(vnode: any, container: any, parentComponent: any) {
    mountChildren(vnode, container, parentComponent);
  }

  function processComponent(vnode: any, container: any, parentComponent: any) {
    mountComponent(vnode, container, parentComponent);
  }
  function mountComponent(
    initinalVNode: any,
    container: any,
    parentComponent: any
  ) {
    const instance = createComponentInstance(initinalVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initinalVNode, container);
  }
  function setupRenderEffect(
    instance: any,
    initinalVNode: any,
    container: any
  ) {
    const { proxy } = instance;

    const subTree = instance.render.call(proxy);
    patch(subTree, container, instance);
    initinalVNode.el = subTree.el;
  }

  function processElement(vnode: any, container: any, parentComponent: any) {
    mountElement(vnode, container, parentComponent);
  }
  function mountElement(vnode: any, container: any, parentComponent: any) {
    const { type, props, children, shapeFlag } = vnode;
    const el = (vnode.el = hostCreateElement(type));

    // string / array
    if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent);
    }

    for (const key in props) {
      const value = props[key];
      // const isOn = (key: string) => {
      //   return /^on[A-Z]/.test(key);
      // };
      // if (isOn(key)) {
      //   const event = key.slice(2).toLowerCase();
      //   el.addEventListener(event, value);
      // } else {
      //   el.setAttribute(key, value);
      // }
      hostPatchProps(el, key, value);
    }

    // container.append(el);
    hostInsert(el, container);
  }
  function mountChildren(
    vnode: { children: any[] },
    container: any,
    parentComponent: any
  ) {
    vnode.children.forEach((v: any) => {
      patch(v, container, parentComponent);
    });
  }
  return {
    createApp: createAppAPI(render),
  };
}
