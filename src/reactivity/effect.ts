let shouldTrack = false;
export class reactiveEffect {
  private _fn: any;
  public scheduler;
  deps = [];
  active = true;
  onStop: any;
  constructor(fn: Function, scheduler?: any) {
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

function cleanupEffect(effect: any) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}

let activeEffect: any;
export function effect(fn: Function, options: any = {}) {
  const scheduler = options.scheduler;
  const _effect = new reactiveEffect(fn, scheduler);
  Object.assign(_effect, options);
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
const targetMap = new WeakMap(); // 用于存储所有的目标对象（即响应式对象）以及它们对应的 depsMap
export function track(target: object, key: any) {
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

export function trackEffect(dep: Set<unknown>) {
  if (dep.has(activeEffect)) return;
  (dep as Set<any>).add(activeEffect);
  activeEffect.deps.push(dep);
}

export function trigger(target: object, key = null) {
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

export function triggerEffects(dep: any) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}
export function stop(runner: { effect: { stop: () => void } }) {
  runner.effect.stop();
}
export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}
