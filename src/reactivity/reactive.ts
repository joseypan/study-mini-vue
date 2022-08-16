import {
  mutableHandlers,
  mutableReadonlyHandlers,
  mutableShallowReadonlyHandlers,
} from "./baseHandlers";
import { track, trigger } from "./effect";
/*
 * 描述：定义数据状态的枚举值
 * 其他说明：
 */
export enum ObjectStatusEnum {
  /*
   * 描述：IS_ACTIVE表示当前数据是响应式数据
   */
  IS_ACTIVE = "__is_active",
  /*
   * 描述：IS_READONLY表示当前数据是只读数据
   */
  IS_READONLY = "__is_readonly",
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
 * 描述：判断是否是响应式对象的方法
 * @param { {[key:string]:any}|typeof Proxy } raw 传入检测的对象
 * @return boolean
 */
export function isReactive(raw) {
  return !!raw[ObjectStatusEnum.IS_ACTIVE];
}
/**
 * 描述：判断数据是否是只读对象的方法
 * @param { {[key:string]:any}|typeof Proxy } raw 传入检测的对象
 * @return boolean
 */
export function isReadonly(raw) {
  return !!raw[ObjectStatusEnum.IS_READONLY];
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

/**
 * 描述：创建一个shallowReadonly对象
 * @param { {[key:string]:any} } raw 传入需要实现响应式的对象
 * @return Proxy 被Proxy代理过后的对象
 */
export function shallowReadonly(raw) {
  return createActiveObject(raw, mutableShallowReadonlyHandlers);
}
