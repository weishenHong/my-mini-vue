import { createVNode } from "../vnode";

export function renderSlots(slots: any, name: any, props: any) {
  const slot = slots[name];
  if (slot) {
    if (typeof slot === "function") {
      return createVNode("div", {}, slot(props));
    }
  }
}
