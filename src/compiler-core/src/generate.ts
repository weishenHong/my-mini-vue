export default function generate(ast: any) {
  const context = createCodegenContext();
  const { push } = context;
  push("return ");
  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");

  push(`function ${functionName}(${signature}){`);
  genNode(ast.codegenNode, context);
  push(`}`);
  return {
    code: context.code,
  };
}
function genNode(node: any, context: any) {
  const { push } = context;
  push(`return '${node.content}'`);
}
function createCodegenContext() {
  const context = {
    code: "",
    push(source: any) {
      context.code += source;
    },
  };
  return context;
}
