export const generate = (ast) => {
  const context = createGenerateContext();
  const functionName = "render";
  const argumentsList = ["_ctx", "_cache"];
  const argument = argumentsList.join(", ");
  context.push(`return function ${functionName}(${argument}){`);
  genNode(ast, context);
  context.push(`}`);
  return {
    code: context.code,
  };
};
/**
 * 描述：获取节点的渲染内容
 * @param { any } ast
 * @param { {code:string,push:(source:string)=>void} } context
 * @return
 */
const genNode = (ast, context) => {
  const { push } = context;
  const content = ast.gencodeNode.content;
  push(`return ${content}`);
};

/**
 * 描述：创建一个generate上下文环境
 * @param {  }
 * @return
 */
const createGenerateContext = () => {
  const context = {
    code: "",
    push: (source) => {
      context.code += source;
    },
  };
  return context;
};
