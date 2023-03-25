import { NodeTypes } from "./ast";

const enum TagType {
  Start,
  End,
}
export function baseParse(content: string) {
  const context = createParseContext(content);
  return createRoot(parseChildren(context));
}
function parseChildren(context: any) {
  const nodes = [];
  let node;
  const s = context.source;
  // 插值类型
  if (s.startsWith("{{")) {
    node = parseInterpolation(context);
  }
  // ELEMENT
  else if (s[0] === "<") {
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context);
    }
  }
  // TEXT
  if (!node) {
    node = parseText(context);
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
  parseTextData(context, rawContentLength);
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
function parseElement(context: any) {
  const element = parseTag(context, TagType.Start);
  parseTag(context, TagType.End);
  return element;
}
function parseTag(context: any, type: TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];

  advanceBy(context, match[0].length);
  advanceBy(context, 1);
  if (type === TagType.End) {
    return;
  }
  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
}
function parseText(context: any): any {
  //  const content =
  const content = parseTextData(context, context.source.length);
  return {
    type: NodeTypes.TEXT,
    content,
  };
}
function parseTextData(context: any, length: any) {
  const content = context.source.slice(0, length);

  advanceBy(context, content.length);
  return content;
}
