import { track, trigger } from "./effect";

export function reactive(raw) {
  return new Proxy(raw, {
    get: (target, key) => {
      // 这里需要做依赖收集
      track(target, key);
      return Reflect.get(target, key);
    },
    set: (target, key, value) => {
      // 这里需要触发相应的依赖
      Reflect.set(target, key, value);
      trigger(target, key);
      return true;
    },
  });
}
/**
 * 描述：实现readonly方法
 * @param { {[key:string]:any} } raw 传入需要实现响应式的对象
 * @return Proxy 被Proxy代理过后的对象
 */
export function readonly(raw) {
  return new Proxy(raw, {
    get: (target, key) => {
      return Reflect.get(target, key);
    },
    set: (target, key, value) => {
      // 这里需要对设置值进行其他操作
      console.warn(
        `当前key:${String(key)}不能被set,因为其是readonly,target:${target}`
      );
      return true;
    },
  });
}
