import { mutableHandlers, mutableReadonlyHandlers } from "./baseHandlers";
import { track, trigger } from "./effect";
/**
 * 描述：创建一个get方法
 * @param { boolean } isReadonly 是否是只读方法
 * @return ()=>any
 */
function createGetter(isReadonly = false) {
  return function (target, key) {
    if (!isReadonly) {
      // 这里需要做依赖收集(只有当不是reandonly时候，才做依赖收集)
      track(target, key);
    }
    return Reflect.get(target, key);
  };
}

/**
 * 描述：创建一个set方法，用来处理set操作
 * @return ()=>boolean
 */
function createSetter() {
  return function (target, key, value) {
    // 这里需要触发相应的依赖
    Reflect.set(target, key, value);
    trigger(target, key);
    return true;
  };
}
/**
 * 描述：声明响应式对象
 * @param { {[key:string]:any} } raw 普通对象
 * @return Proxy 响应式对象
 */
export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers);
}
/**
 * 描述：实现readonly方法
 * @param { {[key:string]:any} } raw 传入需要实现响应式的对象
 * @return Proxy 被Proxy代理过后的对象
 */
export function readonly(raw) {
  return createActiveObject(raw, mutableReadonlyHandlers);
}

/**
 * 描述：将创建proxy对象的方法进行统一提取
 * @param { {[key:string]:any} } raw 需要响应式处理的源对象
 * @param { string } type 需要处理的类型
 * @return Proxy
 */
function createActiveObject(raw, type) {
  return new Proxy(raw, type);
}
