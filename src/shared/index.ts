export const extend = Object.assign;
export function isObject(obj: any) {
  return obj !== null && typeof obj === "object";
}
export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue);

export function hasOwn(val: any, key: any) {
  return Object.prototype.hasOwnProperty.call(val, key);
}
export const capitalize = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
// on-add 这种命名转换为驼峰命名
export const camelize = (string: string) => {
  return string.replace(/-(\w)/g, (_: any, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};
export const tohandlerKey = (str: any) => {
  return str ? "on" + capitalize(str) : "";
};
