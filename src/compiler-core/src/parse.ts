import { NodeTypes } from "./ast";

const enum TagType {
  Start,
  End,
}
export function baseParse(content: string) {
  const context = createParseContext(content);
  return createRoot(parseChildren(context, []));
}
function parseChildren(context: any, ancestors: any) {
  const nodes = [];
  while (!isEnd(context, ancestors)) {
    let node;
    const s = context.source;
    // 插值类型
    if (s.startsWith("{{")) {
      node = parseInterpolation(context);
    }
    // ELEMENT
    else if (s[0] === "<") {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors);
      }
    }
    // TEXT
    if (!node) {
      node = parseText(context);
    }
    nodes.push(node);
  }
  return nodes;
}
// ancestors栈里存放的是tag
function isEnd(context: any, ancestors: any) {
  const s = context.source;
  // 结束的两种情况

  // element的结束标签
  if (s.startsWith("</")) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag;
      if (startsWithEndTagOpen(s, tag)) {
        return true;
      }
    }
  }

  // 全部处理
  return !context.source;
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
  const rawContent = parseTextData(context, rawContentLength);

  const content = rawContent.trim();
  // context.source = ""
  advanceBy(context, closeDelimiter.length);
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
    type: NodeTypes.ROOT,
  };
}
function createParseContext(content: any) {
  return { source: content };
}
function parseElement(context: any, ancestors: any) {
  const element: any = parseTag(context, TagType.Start);
  ancestors.push(element);
  element.children = parseChildren(context, ancestors);
  ancestors.pop();

  // 切割出的字符串和tag不匹配，说明没有结束标签
  if (startsWithEndTagOpen(context.source, element.tag) === element.tag) {
    parseTag(context, TagType.End);
  } else {
    throw new Error(`缺少结束标签:${element.tag}`);
  }
  return element;
}
function startsWithEndTagOpen(source: string, tag: string | any[]) {
  return (
    source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase()
  );
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
  let endTokens = ["{{", "<"];
  let endIndex = context.source.length;
  for (let i = 0; i < endTokens.length; i++) {
    const endToken = endTokens[i];
    const index = context.source.indexOf(endToken);
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }
  const content = parseTextData(context, endIndex);

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
