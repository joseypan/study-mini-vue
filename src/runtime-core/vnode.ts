import { ShapeFlags } from "../share/shapeFlags";
/*
 * 描述：创建Fragment类型
 */
export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");
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
    slots: {},
    key: props && props.key,
    shapeFlag: getShapeFlag(type),
    component: null, //instance实例
  };
  if (typeof children === "string") {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.CHILDREN_TEXT;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.CHILDREN_ARRAY;
  }
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.SLOT_CHILDREN;
    }
  }
  return vnode;
}

/**
 * 描述：创建Text类型的文本节点
 * @param { string } text 文本内容
 * @return
 */
export function createTextVNode(text: string) {
  // 创建一个新节点，类型为Text，children为text
  return createVnode(Text, {}, text);
}

function getShapeFlag(type) {
  // 在创建vnode的时候决定当前是属于哪种类型
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
