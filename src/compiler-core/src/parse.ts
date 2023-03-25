import { NodeTypes } from "./ast";

export function baseParse(content: string) {
  const context = createParseContext(content);
  return createRoot(parseChildren(context));
}
function parseChildren(context: any) {
  const nodes = [];
  let node;
  if (context.source.startsWith("{{")) {
    node = parseInterpolation(context);
  }
  nodes.push(node);
  return nodes;
}
function parseInterpolation(context: any) {
  // context.source: {{message}}
  const openDelimiter = "{{";
  const closeDelimiter = "}}";

  // closeIndex: 9
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );

  // context.source: message}} ( 这一步{{ 已经删除 )
  advanceBy(context, openDelimiter.length);

  // rawContentLength = 9 - 2 = 7 ( message字符串的长度 )
  const rawContentLength = closeIndex - openDelimiter.length;
  // content: message
  const rawContent = context.source.slice(0, rawContentLength);
  const content = rawContent.trim();
  // context.source = ""
  advanceBy(context, rawContentLength + closeDelimiter.length);
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  };
}
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}

function createRoot(children: any) {
  return {
    children,
  };
}
function createParseContext(content: any) {
  return { source: content };
}
