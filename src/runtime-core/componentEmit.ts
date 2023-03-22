import { camelize, tohandlerKey } from "../shared/index";

export function emit(instance: any, event: any, ...args: any[]) {
  // 此处的Instance实际上用户不用传进来，而是在初始化emit方法的时候通过bind的方式传了进来，用户使用时只需要传event

  const { props } = instance;
  // 首字母大写

  const handlerName = tohandlerKey(camelize(event));
  const handler = props[handlerName];
  handler && handler(...args);
}
