/**
 * @FileDescription:处理emit相关逻辑
 * @Author: 潘旭敏
 * @Date: 2022-09-21
 * @LastEditors: 潘旭敏
 * @LastEditTime:2022-09-21 21:49
 */
export function emit(instance: any, event: string, ...args) {
  const { props } = instance;
  // 这个时候需要校验props上是否存在on + 大写+event出去首字母剩下的字母这样一个属性，如果有的话就调用
  const capitalize = (str: string) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  };
  const convertEvent = (str: string) => {
    return str ? `on${capitalize(str)}` : "";
  };
  const camelize = (str: string) => {
    return str
      ? str.replace(/-(\w)/g, (_: string, letter: any) => {
          return letter.toUpperCase();
        })
      : "";
  };
  // 需要判断props上是否有，那么肯定需要拿到实例化对象，不然获取不到props
  const eventName = convertEvent(camelize(event));
  const eventFn = props[eventName];
  eventFn && eventFn(...args);
}
