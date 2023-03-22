export function initProps(
  instance: { vnode?: any; type?: any; props?: any },
  rawProps: {}
) {
  instance.props = rawProps || {};
}
