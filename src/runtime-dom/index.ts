import { createRenderer } from "../runtime-core/index";
export function createElement(type: any) {
  return document.createElement(type);
}

export function patchProps(
  el: HTMLElement,
  key: any,
  prevVal: any,
  nextVal: any
) {
  const isOn = (key: string) => {
    return /^on[A-Z]/.test(key);
  };
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextVal);
  } else {
    if (nextVal === undefined || nextVal === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextVal);
    }
  }
}
export function insert(
  child: HTMLElement,
  container: HTMLElement,
  anchor?: any
) {
  // container.append(el);
  container.insertBefore(child, anchor || null);
}

export function setElementText(el: any, text: any) {
  el.textContent = text;
}
export function remove(child: any) {
  const parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}
const renderer: any = createRenderer({
  createElement,
  patchProps,
  insert,
  remove,
  setElementText,
});
export function createApp(...args: any) {
  return renderer.createApp(...args);
}

export * from "../runtime-core/index";
