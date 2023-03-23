import { createRenderer } from "../runtime-core/index";
export function createElement(type: any) {
  return document.createElement(type);
}

export function patchProps(el: any, key: any, value: any) {
  const isOn = (key: string) => {
    return /^on[A-Z]/.test(key);
  };
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, value);
  } else {
    el.setAttribute(key, value);
  }
}
export function insert(el: any, container: any) {
  container.append(el);
}

const renderer: any = createRenderer({ createElement, patchProps, insert });
export function createApp(...args: any) {
  return renderer.createApp(...args);
}

export * from "../runtime-core/index";
