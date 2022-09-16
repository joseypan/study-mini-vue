import { ShapeFlags } from "../share/shapeFlags";
/**
 * 描述：创建虚拟dom
 * @param { object|string } type 节点的类型，如果是element就是string,如果是component就是object
 * @return object vnode
 */
export function createVnode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type),
  };
  if (typeof children === "string") {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.CHILDREN_TEXT;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.CHILDREN_ARRAY;
  }
  return vnode;
}

function getShapeFlag(type) {
  // 在创建vnode的时候决定当前是属于哪种类型
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
