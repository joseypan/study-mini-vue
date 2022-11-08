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
  return createRoot(parseChildren(context, []));
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
 * 描述：判断children是否都被处理完成
 * @param {  }
 * @return
 */
const isEnd = (context: any, ancestors: { tag: string }[]) => {
  // 终止的情况：1、context.source已经不存在了 2、已经到了结束的标签
  const s = context.source;
  if (s.startsWith("</")) {
    //把当前项和ancestors的最后一项对比，看是否是一致的，就可以看是否匹配
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag;
      if (sourceStartsWithTag(s, tag)) {
        return true;
      }
    }
  }
  return !s;
};
/**
 * 描述：解析子节点
 * @param {  }
 * @return
 */
const parseChildren = (context, ancestors) => {
  const nodeList: any = [];
  let source = context.source;
  let node;
  // 这里需要将所有的children都进行解析，所以得用一个while循环来解决
  while (!isEnd(context, ancestors)) {
    if (source.startsWith("{{")) {
      node = parseInterpolation(context);
    } else if (source.startsWith("<")) {
      //这里主要是去除结束标签的问题
      if (/[a-z]/i.test(source[1])) {
        node = parseElement(context, ancestors);
      }
    }
    if (!node) {
      node = parseText(context);
    }
    nodeList.push(node);
    source = context.source;
  }
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
  context.source = advanceBy(context, closeDelimitre.length);
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
const parseElement = (context: any, ancestors) => {
  const node = parseTag(context, TagType.TAGSTART);
  if (!node) return;
  ancestors.push(node);
  node.children = parseChildren(context, ancestors);
  ancestors.pop();
  if (sourceStartsWithTag(context.source, node.tag)) {
    parseTag(context, TagType.TAGEND);
  } else {
    throw new Error(`lack end tag:${node.tag}`);
  }
  return node;
};
const sourceStartsWithTag = (source, tag) => {
  return source.startsWith("</") && source.slice(2, 2 + tag.length) === tag;
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
    children: [],
  };
};
/**
 * 描述：解析text
 * @param { any } context 上下文
 * @return
 */
const parseText = (context) => {
  //这里需要区分，如果是{{开头或者是<开头，则不应该到字符串结尾处
  let endIndex = context.source.length;
  const endCharater = ["{{", "<"];
  for (let i = 0; i < endCharater.length; i++) {
    const index = context.source.indexOf(endCharater[i]);
    if (index !== -1 && index < endIndex) {
      //说明需要重新定位截取位置
      endIndex = index;
    }
  }
  // 解析
  const content = parseTextData(context, endIndex);
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
  context.source = advanceBy(context, content.length);
  return content;
};
