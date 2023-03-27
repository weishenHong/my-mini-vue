import { effect } from "../reactivity/effect";
import { shapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { createAppAPI } from "./createApp";
import { nextTick, queueJobs } from "./scheduler";
import { Fragment, TEXT } from "./vnode";
export function createRenderer(options: any) {
  const {
    createElement: hostCreateElement,
    patchProps: hostPatchProps,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
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
    patch(null, vnode, container, null, null);
    //
  }

  function patch(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    const { type, shapeFlag } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;

      case TEXT:
        processText(n1, n2, container);
        break;
      default:
        // 判断是component还是element
        if (shapeFlag & shapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor);
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
    parentComponent: any,
    anchor: any
  ) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processComponent(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      updateComponent(n1, n2);
    }
  }
  function updateComponent(n1: any, n2: any) {
    const instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }
  function mountComponent(
    initinalVNode: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    const instance = (initinalVNode.component = createComponentInstance(
      initinalVNode,
      parentComponent
    ));
    setupComponent(instance);
    setupRenderEffect(instance, initinalVNode, container, anchor);
  }
  function setupRenderEffect(
    instance: any,
    initinalVNode: any,
    container: any,
    anchor: any
  ) {
    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          const { proxy } = instance;
          const subTree = (instance.subTree = instance.render.call(
            proxy,
            proxy
          ));
          patch(null, subTree, container, instance, anchor);
          initinalVNode.el = subTree.el;
          instance.isMounted = true;
        } else {
          // update
          const { next, vnode } = instance;
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          }

          const { proxy } = instance;
          const subTree = instance.render.call(proxy, proxy);
          const prevSubTree = instance.subTree;
          patch(prevSubTree, subTree, container, instance, anchor);
        }
      },
      {
        scheduler() {
          console.log("update");
          queueJobs(instance.update);
        },
      }
    );
  }
  function updateComponentPreRender(instance: any, nextVNode: any) {
    instance.vnode = nextVNode;
    instance.next = null;
    instance.props = nextVNode.props;
  }
  function processElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }
  function patchElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    const el = (n2.el = n1.el);
    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }
  function patchChildren(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    const { shapeFlag: prevShapeFlag, children: c1 } = n1;
    const { shapeFlag, children: c2 } = n2;
    if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & shapeFlags.ARRAY_CHILDREN) {
        // 清空
        unmountChildren(n1.children);
      }
      // 设置新的text
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & shapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // array  diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }
  function isSomeVNodeType(
    n1: { type: any; key: any },
    n2: { type: any; key: any }
  ) {
    return n1.type === n2.type && n1.key === n2.key;
  }
  function patchKeyedChildren(
    c1: any,
    c2: any,
    container: any,
    parentComponent: any,
    parentAnchor?: any
  ) {
    // 两端指针
    let i = 0;
    const l1 = c1.length;
    const l2 = c2.length;
    let e1: any = l1 - 1;
    let e2: any = l2 - 1;

    // 1、从头开始移动指针，相同的遍历，遇到不同break
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }

    // 2、从尾开始移动指针，相同的遍历，遇到不同break
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // 3、新的比老的长, 创建新的
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    }
    // 4、老的比新的长, 删除老的
    else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    }
    // 5、对中间的未知序列进行对比
    else {
      let s1 = i; // 老的开始
      let s2 = i; // 新的开始

      // 记录已经处理的新节点
      let toBePatched = e2 - s2 + 1;
      let patched = 0;

      // 5.1 建立新节点的 key: index 映射, 后续需要通过旧节点key来获取新节点的下标
      const keyToNewIndexMap = new Map();
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      // 初始化映射数组
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);

      let moved = false;
      let maxNewIndexSofar = 0;

      // 5.2 遍历旧节点，在新节点中查找相同的节点, 找到patch， 找不到删除
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        // 遍历过程中发现所有新节点都被处理过了，还未处理的老的节点就移除
        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }

        // 寻找相同的新节点
        let newIndex;
        if (prevChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          // 用户没有设置key，遍历所有新节点, 尝试定位相同类型的无键节点
          for (let j = s2; j <= e2; j++) {
            if (isSomeVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === undefined) {
          // 不存在就删除这个旧节点
          hostRemove(prevChild.el);
        } else {
          // newIndex表示的是旧节点在新节点中下标，判断这个下标的关系，如果是一个递增的数列，就是没有节点被移动,  不需要做相关的移动逻辑
          if (newIndex >= maxNewIndexSofar) {
            maxNewIndexSofar = newIndex;
          } else {
            moved = true;
          }

          // 映射当前新节点在老节点中的位置，用作后续查找最长子序列
          // 在映射表里如果是0表示新节点不存在于老节点，为了兼容下标为0的情况，所以加1
          newIndexToOldIndexMap[newIndex - s2] = i + 1;

          // 对子节点进行patch
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }

      // 5.3 移动顺序变更的节点、 生成新节点
      // 获取最长递增子序列
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      // 最长递增子序列的指针
      let j = increasingNewIndexSequence.length - 1;
      // 从倒序开始，避免移动位置出现问题
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null; // 超出长度的话默认加到最后即可

        // 映射为0代表新节点在旧节点中不存在， 需要新建
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        }
        // 移动节点逻辑
        else if (moved) {
          // 移动i指针, 和最长子序列中j指针对应的下标对比, 判断是否是稳定序列，是否需要移动
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            // 如果不相同，说明当前节点需要移动
            hostInsert(nextChild.el, container, anchor);
          } else {
            // 相同的话，移动j指针
            j--;
          }
        }
      }
    }
  }
  function unmountChildren(children: any) {
    for (let i = 0; i < children.length; i++) {
      const element = children[i];
      hostRemove(element);
    }
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
  function mountElement(
    vnode: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    const { type, props, children, shapeFlag } = vnode;
    const el = (vnode.el = hostCreateElement(type));

    // string / array
    if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor);
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
    hostInsert(el, container, anchor);
  }
  function mountChildren(
    children: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    children.forEach((v: any) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }
  return {
    createApp: createAppAPI(render),
  };
}

// 获取最长递增子序列
function getSequence(arr: any[]) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
