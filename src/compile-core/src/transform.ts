import { NodeTypes } from "./ast";
/**
 * @FileDescription:处理编译阶段的transform过程
 * @Author: 潘旭敏
 * @Date: 2022-11-10
 * @LastEditors: 潘旭敏
 * @LastEditTime:2022-11-10 00:20
 */
export const transform = (root, options) => {
  const context = createTransformContext(root, options);
  //遍历整个ast树，然后找到对应的节点进行处理
  tranversTree(root, context);
};
/**
 * 描述：创建transform的上下文环境
 * @param {  }
 * @return
 */
const createTransformContext = (root, options) => {
  return {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };
};

/**
 * 描述：遍历树结构
 * @param { any } root 根节点
 * @param { {root:any,nodeTransforms:any[]} } context 上下文环境
 * @return
 */
const tranversTree = (root, context) => {
  if (!root) return null;
  const stack = [root];
  while (stack.length) {
    const curNode = stack.pop();
    if (curNode === null) {
      const node = stack.pop();
      //这里需要对节点类型进行判断，可能要对不同的节点类型进行不同的操作，但是如果把所有的判断都写在这，就把程序写死了，而且很臃肿
      for (let i = 0; i < context.nodeTransforms.length; i++) {
        context.nodeTransforms[i](node);
      }
    } else {
      //这里有个坑，curNode不一定有children属性
      const children = curNode.children || [];
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i]);
      }
      stack.push(curNode);
      stack.push(null);
    }
  }
};
