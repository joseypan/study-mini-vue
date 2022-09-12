/**
 * @FileDescription:处理h函数创建虚拟dom逻辑
 * @Author: 潘旭敏
 * @Date: 2022-09-12
 * @LastEditors: 潘旭敏
 * @LastEditTime:2022-09-12 16:47
 */
import { createVnode } from "./vnode";
export function h(type, props?, children?) {
  return createVnode(type, props, children);
}
