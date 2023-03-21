import { reactive, ReactiveFlags, readonly } from "./index";
import { extend, isObject } from "../shared/index";
import { track, trigger } from "./effect";

const get = createGetter();
const readonlyGet = createGetter({ isReadonly: true });
const shallowReadonlyGet = createGetter({ isReadonly: true, shallow: true });
const set = createSetter();
export const mutableHandlers = {
  get,
  set,
};
export const readonlyHandlers = {
  get: readonlyGet,
  set() {
    console.warn("realonly !");
    return true;
  },
};
export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});

export function createGetter({ isReadonly = false, shallow = false } = {}) {
  return function get(original: object, key: PropertyKey, receiver: any): any {
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
export function createSetter() {
  return function set(target: any, key: any, newValue: any, receiver: any) {
    const res = Reflect.set(target, key, newValue, receiver);
    // TODO 触发依赖

    trigger(target, key);
    return res;
  };
}
