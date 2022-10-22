/**
 * @FileDescription:用来定义shapFlags相关枚举和逻辑
 * @Author: 潘旭敏
 * @Date: 2022-09-16
 * @LastEditors: 潘旭敏
 * @LastEditTime:2022-09-16 21:23
 */
export enum ShapeFlags {
  ELEMENT = 1, //0001 (位运算左移)
  STATEFUL_COMPONENT = 1 << 1, //0010
  CHILDREN_TEXT = 1 << 2, //0100
  CHILDREN_ARRAY = 1 << 3, // 1000
  SLOT_CHILDREN = 1 << 4,
}
// 100 -> 101
