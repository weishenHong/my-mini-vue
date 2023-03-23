import { effect } from "../reactivity/effect";
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
    patch(null, vnode, container, null);
    //
  }

  function patch(n1: any, n2: any, container: any, parentComponent: any) {
    const { type, shapeFlag } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;

      case TEXT:
        processText(n1, n2, container);
        break;
      default:
        // 判断是component还是element
        if (shapeFlag & shapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }

  function processText(n1: any, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function processFragment(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any
  ) {
    mountChildren(n2, container, parentComponent);
  }

  function processComponent(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any
  ) {
    mountComponent(n2, container, parentComponent);
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
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        patch(null, subTree, container, instance);
        initinalVNode.el = subTree.el;
        instance.isMounted = true;
      } else {
        // update
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;
        patch(prevSubTree, subTree, container, instance);
      }
    });
  }

  function processElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      patchElement(n1, n2, container);
    }
  }
  function patchElement(n1: any, n2: any, container: any) {
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    const el = (n2.el = n1.el);
    patchProps(el, oldProps, newProps);
  }
  function patchProps(el: any, oldProps: any, newProps: any) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (nextProp !== prevProp) {
          hostPatchProps(el, key, prevProp, nextProp);
        }
      }
      for (const key in oldProps) {
        const prevProp = oldProps[key];
        if (!(key in newProps)) {
          hostPatchProps(el, key, prevProp, null);
        }
      }
    }
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
      hostPatchProps(el, key, null, value);
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
      patch(null, v, container, parentComponent);
    });
  }
  return {
    createApp: createAppAPI(render),
  };
}
