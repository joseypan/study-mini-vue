import { NodeTypes } from "./ast";
enum TagType {
  /*
   * 描述：tag开始标签
   */
  TAGSTART = "TAGSTART",
  /*
   * 描述：tag结束标签
   */
  TAGEND = "TAGEND",
}
/**
 * 描述：对模板字符串进行解析
 * @param { string } content 传入的内容
 * @return
 */
export const baseParese = (content: string) => {
  const context = createParseContext(content); //创建一个上下文环境
  return createRoot(parseChildren(context));
};
/**
 * 描述：创建根节点
 * @param { array } children 根内容的子节点
 * @return {children:array} 子节点
 */
const createRoot = (children) => {
  return {
    children,
  };
};

/**
 * 描述：解析子节点
 * @param {  }
 * @return
 */
const parseChildren = (context) => {
  const nodeList: any = [];
  const source = context.source;
  let node;
  if (source.startsWith("{{")) {
    node = parseInterpolation(context);
  } else if (source.startsWith("<")) {
    console.log("parse element");
    node = parseElement(context);
  }
  if (!node) {
    node = parseText(context);
  }
  nodeList.push(node);
  return nodeList;
};
/**
 * 描述：解析表达式
 * @param {  }
 * @return
 */
const parseInterpolation = (context) => {
  //目前要对{{message}} 进行解析,需要将message提取出来,思路是先匹配}找到其索引作为endIndex，然后从index+2到endIndex进行截取即可
  const openDelimitre = "{{";
  const closeDelimitre = "}}";
  const endIndex = context.source.indexOf(closeDelimitre);
  context.source = advanceBy(context, openDelimitre.length);
  const contentRaw = parseTextData(context, endIndex - closeDelimitre.length);
  const content = contentRaw.trim();
  context.source = advanceBy(
    context,
    contentRaw.length + closeDelimitre.length
  );
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  };
};
const advanceBy = (context: any, length: number) => {
  return context.source.slice(length);
};
const createParseContext = (content: string) => {
  return {
    source: content,
  };
};

/**
 * 描述：解析element的逻辑
 * @param { any } context 上下文环境
 * @return
 */
const parseElement = (context: any) => {
  const node = parseTag(context, TagType.TAGSTART);
  parseTag(context, TagType.TAGEND);
  return node;
};
const parseTag = (context: any, type: TagType) => {
  // 解析tag
  // 删除解析出来的内容
  const tagReg = /^<\/?([a-z]*)/i;
  const execList: any = tagReg.exec(context.source);
  const tag = execList[1];
  context.source = advanceBy(context, execList[0].length);
  context.source = advanceBy(context, 1);
  if (type === TagType.TAGEND) return;
  return {
    type: NodeTypes.ELEMENT,
    tag: tag,
  };
};
/**
 * 描述：解析text
 * @param { any } context 上下文
 * @return
 */
const parseText = (context) => {
  // 解析
  const content = parseTextData(context, context.source.length);
  // 推进
  return {
    type: NodeTypes.TEXT,
    content,
  };
};

/**
 * 描述：处理text内容
 * @param {  }
 * @return
 */
const parseTextData = (context, length) => {
  const content = context.source.slice(0, length);
  advanceBy(context, content.length);
  return content;
};
