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
