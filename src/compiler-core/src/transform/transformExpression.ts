import { NodeTypes } from "../ast";

export default function transformExpression(node: any) {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(node.content);
  }
}
function processExpression(node: any): any {
  node.content = "_ctx." + node.content;
  return node;
}
