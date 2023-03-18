export  const extend = Object.assign
export function isObject(obj) {
    return obj !== null && typeof obj ==='object'
}
export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)