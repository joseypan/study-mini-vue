/**
 * @FileDescription:用于公共处理的方法
 * @Author: 潘旭敏
 * @Date: 2022-08-09
 * @LastEditors: 潘旭敏
 * @LastEditTime:2022-08-09 00:02
 */
export const isObject = (data: unknown) => {
  return data !== null && typeof data === "object";
};
/**
 * 描述：判断值是否发生改动
 * @param { any } rawValue newValue
 * @return boolean
 */
export function hasChanged(rawValue, newValue) {
  return Object.is(rawValue, newValue);
}
/**
 * 描述：判断对象本身是否有该属性
 * @param { any } target 目标对象
 * @param { any } key 查询的属性key
 * @return boolean true表示包含该属性 false表示不包含该属性
 */
export const hasOwn = (target, key) =>
  Object.prototype.hasOwnProperty.call(target, key);
