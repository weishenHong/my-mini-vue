import { shapeFlags } from "../shared/shapeFlags";

export function initSlots(instance: any, children: any) {
  const { vnode } = instance;
  if (vnode.shapeFlag & shapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots);
  }
}
function normalizeObjectSlots(children: any, slots: any) {
  for (const key in children) {
    const value = children[key];
    slots[key] = (props: any) => normalizeSlotValue(value(props));
  }
}

function normalizeSlotValue(value: any) {
  return Array.isArray(value) ? value : [value];
}
