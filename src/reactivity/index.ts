import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from "./baseHandler";

export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadobly",
}
export function reactive(original: any) {
  // proxy 对象
  return new Proxy(original, mutableHandlers);
}

export function readonly(original: any) {
  return new Proxy(original, readonlyHandlers);
}
export function shallowReadonly(original: any) {
  return new Proxy(original, shallowReadonlyHandlers);
}

export function isReactive(value: { [x: string]: any }) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}
export function isReadonly(value: { [x: string]: any }) {
  return !!value[ReactiveFlags.IS_READONLY];
}
export function isProxy(value: any) {
  return isReactive(value) || isReadonly(value);
}
