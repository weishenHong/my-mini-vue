import { hasOwn } from "../shared/index";

const publicPropetiesMap: any = {
  $el: (i: any) => i.vnode.el,
};
export const PublicInstanceProxyHandlers = {
  get({ _: instance }: any, key: string) {
    const { setupState, props } = instance;

    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }
    const publicGetter = publicPropetiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
