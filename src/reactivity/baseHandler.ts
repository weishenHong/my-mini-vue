import { track, trigger } from "./effect";

const get = createGetter()
const readonlyGet = createGetter(true)
const set = createSetter()
export const mutableHandlers = {
    get,
    set
  
}
export const readonlyHandlers = {
    get: readonlyGet,
    set()  {
        console.warn('realonly !')
        return true
    }
}

export function createGetter(isReadonly = false) {
  return function get(original, key, receiver) {
    const res = Reflect.get(original, key, receiver);
    if(!isReadonly) {
        // TODO 依赖收集
        track(original, key);
    }
    return res;
  };
}
export function createSetter() {
    return function set(target, key, newValue, receiver) {
      const res = Reflect.set(target, key, newValue, receiver);
      // TODO 触发依赖

      trigger(target, key);
      return res;
    }
}