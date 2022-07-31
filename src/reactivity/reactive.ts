import { track, trigger } from "./effect";

function reactive(raw) {
  let obj = new Proxy(raw, {
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
  return obj;
}
export default reactive;
