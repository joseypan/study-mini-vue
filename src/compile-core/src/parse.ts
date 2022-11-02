import { NodeTypes } from "./ast";
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
  const node = parseInterpolation(context);
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
  const contentRaw = context.source.slice(0, endIndex - closeDelimitre.length);
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
 * 描述：创建children
 * @param {  }
 * @return
 */
