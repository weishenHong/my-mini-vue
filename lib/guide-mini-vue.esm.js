const Fragment = Symbol("Fragment");
const TEXT = Symbol("TEXT");
function createVNode(type, props, children) {
  const vnode = {
    type,
    props,
    children,
    component: null,
    next: null,
    shapeFlag: getShapeFlag(type),
    key: props === null || props === void 0 ? void 0 : props.key,
    el: null,
  };
  if (typeof children === "string") {
    // vnode.shapeFlag = vnode.shapeFlag | shapeFlags.TEXT_CHILDREN  简化后 ↓
    vnode.shapeFlag |= 4 /* shapeFlags.TEXT_CHILDREN */;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= 8 /* shapeFlags.ARRAY_CHILDREN */;
  }
  if (vnode.shapeFlag & 2 /* shapeFlags.STATEFUL_COMPONENT */) {
    if (typeof children === "object") {
      vnode.shapeFlag |= 16 /* shapeFlags.SLOT_CHILDREN */;
    }
  }
  return vnode;
}
function createTextVNode(text) {
  return createVNode(TEXT, {}, text);
}
function getShapeFlag(type) {
  return typeof type === "string"
    ? 1 /* shapeFlags.ELEMENT */
    : 2 /* shapeFlags.STATEFUL_COMPONENT */;
}

function h(type, props, children) {
  return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
  const slot = slots[name];
  if (slot) {
    if (typeof slot === "function") {
      return createVNode(Fragment, {}, slot(props));
    }
  }
}

const extend = Object.assign;
function isObject(obj) {
  return obj !== null && typeof obj === "object";
}
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
function hasOwn(val, key) {
  return Object.prototype.hasOwnProperty.call(val, key);
}
const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
// on-add 这种命名转换为驼峰命名
const camelize = (string) => {
  return string.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : "";
  });
};
const tohandlerKey = (str) => {
  return str ? "on" + capitalize(str) : "";
};

let shouldTrack = false;
class reactiveEffect {
  constructor(fn, scheduler) {
    this.deps = [];
    this.active = true;
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    shouldTrack = true;
    activeEffect = this;
    const res = this._fn();
    // 重置
    shouldTrack = false;
    activeEffect = undefined;
    return res;
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}
function cleanupEffect(effect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}
let activeEffect;
function effect(fn, options = {}) {
  const scheduler = options.scheduler;
  const _effect = new reactiveEffect(fn, scheduler);
  Object.assign(_effect, options);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
const targetMap = new WeakMap(); // 用于存储所有的目标对象（即响应式对象）以及它们对应的 depsMap
function track(target, key) {
  if (!isTracking()) {
    return;
  }
  let depsMap = targetMap.get(target); //用于存储目标对象的所有响应式属性以及它们对应的依赖列表 dep。
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key); // dep 是一个 Set 对象，用于存储所有依赖于某个响应式属性的 effect 函数
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  trackEffect(dep);
}
function trackEffect(dep) {
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}
function trigger(target, key = null) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const dep = depsMap.get(key);
  triggerEffects(dep);
  // const effects = new Set()
  // 收集所有与 target[key] 相关的 effect
  // const addEffects = (dep) => {
  //   dep.forEach((effect) => {
  //     effects.add(effect)
  //   })
  // }
  // if (key !== null) {
  //   const dep = depsMap.get(key)
  //   if (dep) {
  //     addEffects(dep)
  //   }
  // } else {
  //     // 如果不指定 key，则会遍历 depsMap 中所有的 dep，收集它们中的 effect 并执行。
  //   depsMap.forEach(addEffects)
  // }
  // // 执行所有相关的 effect
  // effects.forEach((effect) => {
  //   if(effect.scheduler) {
  //     effect.scheduler()
  //   }else {
  //     effect.run()
  //   }
  // })
}
function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}
function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

const get = createGetter();
const readonlyGet = createGetter({ isReadonly: true });
const shallowReadonlyGet = createGetter({ isReadonly: true, shallow: true });
const set = createSetter();
const mutableHandlers = {
  get,
  set,
};
const readonlyHandlers = {
  get: readonlyGet,
  set() {
    console.warn("realonly !");
    return true;
  },
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
function createGetter({ isReadonly = false, shallow = false } = {}) {
  return function get(original, key, receiver) {
    const res = Reflect.get(original, key, receiver);
    if (isObject(res) && !shallow) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    }
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    if (!isReadonly) {
      // TODO 依赖收集
      track(original, key);
    }
    return res;
  };
}
function createSetter() {
  return function set(target, key, newValue, receiver) {
    const res = Reflect.set(target, key, newValue, receiver);
    // TODO 触发依赖
    trigger(target, key);
    return res;
  };
}

class RefImpl {
  constructor(value) {
    this.dep = new Set();
    this._v_isRef = true;
    this._rawValue = value;
    this._value = convert(value);
  }
  get value() {
    if (isTracking()) {
      trackEffect(this.dep);
    }
    return this._value;
  }
  set value(newValue) {
    if (!hasChanged(this._rawValue, newValue)) return;
    this._rawValue = newValue;
    this._value = convert(newValue);
    triggerEffects(this.dep);
  }
}
function ref(value) {
  return new RefImpl(value);
}
function convert(value) {
  return isObject(value) ? reactive(value) : value;
}
function isRef(ref) {
  return !!ref._v_isRef;
}
function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        target[key].value = value;
        return true;
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}

var ReactiveFlags;
(function (ReactiveFlags) {
  ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
  ReactiveFlags["IS_READONLY"] = "__v_isReadobly";
})(ReactiveFlags || (ReactiveFlags = {}));
function reactive(original) {
  // proxy 对象
  return createReactiveObject(original, mutableHandlers);
}
function readonly(original) {
  return createReactiveObject(original, readonlyHandlers);
}
function shallowReadonly(original) {
  return createReactiveObject(original, shallowReadonlyHandlers);
}
function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}
function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}
function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
function createReactiveObject(target, baseHandler) {
  if (!isObject(target)) {
    console.error("target is`t object");
    return;
  }
  return new Proxy(target, baseHandler);
}

function emit(instance, event, ...args) {
  // 此处的Instance实际上用户不用传进来，而是在初始化emit方法的时候通过bind的方式传了进来，用户使用时只需要传event
  const { props } = instance;
  // 首字母大写
  const handlerName = tohandlerKey(camelize(event));
  const handler = props[handlerName];
  handler && handler(...args);
}

function initProps(instance, rawProps) {
  instance.props = rawProps || {};
}

const publicPropetiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots,
  $props: (i) => i.props,
};
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance;
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }
    const publicGetter = publicPropetiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};

function initSlots(instance, children) {
  const { vnode } = instance;
  if (vnode.shapeFlag & 16 /* shapeFlags.SLOT_CHILDREN */) {
    normalizeObjectSlots(children, instance.slots);
  }
}
function normalizeObjectSlots(children, slots) {
  for (const key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeSlotValue(value(props));
  }
}
function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
  const component = {
    setupState: {},
    props: {},
    vnode,
    type: vnode.type,
    emit: () => {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    isMounted: false,
    subTree: {},
  };
  component.emit = emit.bind(null, component);
  return component;
}
function setupComponent(instance) {
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);
  setupStatefuComponent(instance);
}
let currentInstance = null;
function setupStatefuComponent(instance) {
  const component = instance.type;
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
  const { setup } = component;
  if (setup) {
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    setCurrentInstance(null);
    handleSetupResult(instance, setupResult);
  }
}
function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === "object") {
    instance.setupState = proxyRefs(setupResult);
  }
  finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
  const component = instance.type;
  if (component.render) {
    instance.render = component.render;
  }
}
function getCurrentInstance() {
  return currentInstance;
}
function setCurrentInstance(instance) {
  currentInstance = instance;
}

function provide(key, value) {
  const currentInstance = getCurrentInstance();
  if (currentInstance) {
    let { provides } = currentInstance;
    const parentProvides = currentInstance.parent.provides;
    if (provides === parentProvides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue) {
  const currentInstance = getCurrentInstance();
  if (currentInstance) {
    const { parent } = currentInstance;
    const parentProvides = parent.provides;
    if (key in parentProvides) {
      return parentProvides[key];
    } else if (defaultValue) {
      if (typeof defaultValue === "function") {
        return defaultValue();
      }
      return defaultValue;
    }
  }
}

function shouldUpdateComponent(prevVNode, nextVNode) {
  const { props: prevProps } = prevVNode;
  const { props: nextProps } = nextVNode;
  for (const key in nextProps) {
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  return false;
}

function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        const vnode = createVNode(rootComponent);
        render(vnode, rootContainer);
      },
    };
  };
}

const queue = [];
// 判断当前是否有更新任务正在等待被执行。如果isFlushPending为true，那么说明当前更新任务已经被加入到更新队列中，但是还没有被执行。
let isFlushPending = false;
let p = Promise.resolve();
function nextTick(fn) {
  // 传入fn，将fn用then推入到微任务队列中，没有传入，则返回一个promise( 可以让用户await )
  return fn ? p.then(fn) : p;
}
function queueJobs(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  queueFlush();
}
function queueFlush() {
  // 更新任务还没有被执行，不会重复添加另一个更新任务
  if (isFlushPending) return;
  isFlushPending = true;
  // 用微任务异步更新
  nextTick(flushJobs);
}
function flushJobs() {
  isFlushPending = false;
  let job;
  while ((job = queue.shift())) {
    job && job();
  }
}

function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProps: hostPatchProps,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;
  function render(vnode, container) {
    patch(null, vnode, container, null, null);
    //
  }
  function patch(n1, n2, container, parentComponent, anchor) {
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
        if (shapeFlag & 1 /* shapeFlags.ELEMENT */) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & 2 /* shapeFlags.STATEFUL_COMPONENT */) {
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }
  function processText(n1, n2, container) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }
  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }
  function processComponent(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      updateComponent(n1, n2);
    }
  }
  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }
  function mountComponent(initinalVNode, container, parentComponent, anchor) {
    const instance = (initinalVNode.component = createComponentInstance(
      initinalVNode,
      parentComponent
    ));
    setupComponent(instance);
    setupRenderEffect(instance, initinalVNode, container, anchor);
  }
  function setupRenderEffect(instance, initinalVNode, container, anchor) {
    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          const { proxy } = instance;
          const subTree = (instance.subTree = instance.render.call(proxy));
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
          const subTree = instance.render.call(proxy);
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
  function updateComponentPreRender(instance, nextVNode) {
    instance.vnode = nextVNode;
    instance.next = null;
    instance.props = nextVNode.props;
  }
  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }
  function patchElement(n1, n2, container, parentComponent, anchor) {
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    const el = (n2.el = n1.el);
    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }
  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const { shapeFlag: prevShapeFlag, children: c1 } = n1;
    const { shapeFlag, children: c2 } = n2;
    if (shapeFlag & 4 /* shapeFlags.TEXT_CHILDREN */) {
      if (prevShapeFlag & 8 /* shapeFlags.ARRAY_CHILDREN */) {
        // 清空
        unmountChildren(n1.children);
      }
      // 设置新的text
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 4 /* shapeFlags.TEXT_CHILDREN */) {
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // array  diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }
  function isSomeVNodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key;
  }
  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    // 两端指针
    let i = 0;
    const l1 = c1.length;
    const l2 = c2.length;
    let e1 = l1 - 1;
    let e2 = l2 - 1;
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
  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const element = children[i];
      hostRemove(element);
    }
  }
  function patchProps(el, oldProps, newProps) {
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
  function mountElement(vnode, container, parentComponent, anchor) {
    const { type, props, children, shapeFlag } = vnode;
    const el = (vnode.el = hostCreateElement(type));
    // string / array
    if (shapeFlag & 4 /* shapeFlags.TEXT_CHILDREN */) {
      el.textContent = children;
    } else if (shapeFlag & 8 /* shapeFlags.ARRAY_CHILDREN */) {
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
  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }
  return {
    createApp: createAppAPI(render),
  };
}
// 获取最长递增子序列
function getSequence(arr) {
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

function createElement(type) {
  return document.createElement(type);
}
function patchProps(el, key, prevVal, nextVal) {
  const isOn = (key) => {
    return /^on[A-Z]/.test(key);
  };
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextVal);
  } else {
    if (nextVal === undefined || nextVal === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextVal);
    }
  }
}
function insert(child, container, anchor) {
  // container.append(el);
  container.insertBefore(child, anchor || null);
}
function setElementText(el, text) {
  el.textContent = text;
}
function remove(child) {
  const parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}
const renderer = createRenderer({
  createElement,
  patchProps,
  insert,
  remove,
  setElementText,
});
function createApp(...args) {
  return renderer.createApp(...args);
}

export {
  ReactiveFlags,
  createApp,
  createElement,
  createReactiveObject,
  createRenderer,
  createTextVNode,
  getCurrentInstance,
  h,
  inject,
  insert,
  isProxy,
  isReactive,
  isReadonly,
  nextTick,
  patchProps,
  provide,
  proxyRefs,
  reactive,
  readonly,
  ref,
  remove,
  renderSlots,
  setElementText,
  shallowReadonly,
};
