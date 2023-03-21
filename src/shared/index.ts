export const extend = Object.assign;
export function isObject(obj: any) {
  return obj !== null && typeof obj === "object";
}
export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue);
