import { track, trigger } from "./effect";
/*
 * 描述：为了防止get和set方法每次都重新声明，所以做优化，让其只初始化声明一次
 * 其他说明：
 */
const get = createGetter();
const set = createSetter();
const readonlySet = createReadonlySetter();

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
 * 描述：创建属于readonly的set方法，用来处理set操作
 * @return ()=>boolean
 */
function createReadonlySetter() {
  return function (target, key, value) {
    // 这里需要对设置值进行其他操作
    console.warn(
      `当前key:${String(key)}不能被set,因为其是readonly,target:${target}`
    );
    return true;
  };
}
export const mutableHandlers = {
  get,
  set,
};
export const mutableReadonlyHandlers = {
  get,
  set: readonlySet,
};
