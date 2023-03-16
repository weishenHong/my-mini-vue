import {  mutableHandlers, readonlyHandlers } from "./baseHandler";

export enum ReactiveFlags  {
    IS_REACTIVE = '__v_isReactive',
IS_READONLY = '__v_isReadobly'
}
export function reactive(original: any) {
  // proxy 对象
  return new Proxy(original, mutableHandlers);
}

export function readonly(original) {
  return new Proxy(original, readonlyHandlers );

}

export function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE]
}
export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY]
}