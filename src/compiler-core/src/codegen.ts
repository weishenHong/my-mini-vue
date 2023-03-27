import { NodeTypes } from "./ast";
import { helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers";

export default function generate(ast: any) {
  const context = createCodegenContext();
  const { push } = context;

  newFunctionPreamble(ast, context);

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
function newFunctionPreamble(ast: any, context: any) {
  const { push } = context;
  const VueBinging = "Vue";
  const aliasHelper = (s: any) => `${helperMapName[s]}: _${helperMapName[s]}`;
  if (ast.helpers.length > 0) {
    push(`const { ${ast.helpers.map(aliasHelper).join(", ")}} = ${VueBinging}`);
  }
  push("\n");
  push("return ");
}

function genNode(node: any, context: any) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(context, node);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(context, node);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(context, node);
      break;
    default:
      break;
  }
}
function genText(context: any, node: any) {
  const { push } = context;
  push(`return '${node.content}'`);
}

function createCodegenContext() {
  const context = {
    code: "",
    push(source: any) {
      context.code += source;
    },
    helper(key: any) {
      return `_${helperMapName[key]}`;
    },
  };
  return context;
}
function genInterpolation(context: any, node: any) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(")");
}
function genExpression(context: any, node: any) {
  const { push } = context;
  push(`${node.content}`);
}
