import { ShapeFlags } from "./../share/shapeFlags";
/**
 * 描述：处理组件的slots
 * @param { any } instance 组件实例对象
 * @param { any } children 组件传入的子集
 * @return void
 */
export function initSlots(instance, children) {
  // 这里进行一定的优化，不一定所有的children都有，或者是都是slots
  if (instance.vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeSlotObject(children, instance.slots);
  }
}
function normalizeSlotObject(children, slots) {
  // 这里的slots也要转成对象的形式
  for (const key in children) {
    slots[key] = (props) => {
      return normalizeSlotValue(children[key](props));
    };
  }
}
function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value];
}
