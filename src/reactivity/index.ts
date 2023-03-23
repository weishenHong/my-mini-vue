import { isObject } from "../shared/index";
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
  return createReactiveObject(original, mutableHandlers);
}

export function readonly(original: any) {
  return createReactiveObject(original, readonlyHandlers);
}
export function shallowReadonly(original: any) {
  return createReactiveObject(original, shallowReadonlyHandlers);
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
export function createReactiveObject(target: any, baseHandler: any) {
  if (!isObject(target)) {
    console.error("target is`t object");
    return;
  }
  return new Proxy(target, baseHandler);
}

export { ref, proxyRefs } from "./ref";
