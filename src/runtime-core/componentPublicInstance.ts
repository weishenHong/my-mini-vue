const publicPropetiesMap: any = {
  $el: (i: any) => i.vnode.el,
};
export const PublicInstanceProxyHandlers = {
  get({ _: instance }: any, key: string) {
    const setupState = instance.setupState;

    if (key in setupState) {
      return setupState[key];
    }
    const publicGetter = publicPropetiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
