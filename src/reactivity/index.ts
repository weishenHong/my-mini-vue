import {  mutableHandlers, readonlyHandlers } from "./baseHandler";

export function reactive(original: any) {
  // proxy 对象
  return new Proxy(original, mutableHandlers);
}

export function readonly(original) {
  return new Proxy(original, readonlyHandlers );

}
