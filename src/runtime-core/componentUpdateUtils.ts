export function shouldUpdateComponent(
  prevVNode: { props: any },
  nextVNode: { props: any }
) {
  const { props: prevProps } = prevVNode;
  const { props: nextProps } = nextVNode;

  for (const key in nextProps) {
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  return false;
}
