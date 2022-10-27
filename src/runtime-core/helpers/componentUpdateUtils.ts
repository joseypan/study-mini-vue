export const shouldComponentUpdate = (prevVnode, nextVnode) => {
  //遍历新的vnode如果说两个不相等就返回false
  for (let key in nextVnode.props) {
    if (nextVnode.props[key] !== prevVnode.props[key]) {
      return true;
    }
  }
  return false;
};
