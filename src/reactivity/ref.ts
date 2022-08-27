import { isObject } from "./../share/index";
import { hasChanged } from "../share";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

/*
 * 描述：声明一个类进行统一的ref相关操作，方便管理
 */
class RefImp {
  private _value: any;
  public deps: Set<unknown>;
  private _rawValue: any;
  public __v_isRef = true;
  constructor(value) {
    this._rawValue = value;
    // 需要考虑传入的value是不是对象
    /*
     * 描述：将传入的value进行值的存储
     */
    this._value = isObject(value) ? reactive(value) : value;
    this.deps = new Set();
  }
  get value() {
    if (isTracking()) {
      //需要在这里也进行依赖收集，联想到之前的track方法
      trackEffects(this.deps);
    }
    return this._value;
  }
  set value(newValue) {
    // 在这里需要考虑到对象之间的比较，最好存一份之前的未经过响应式的数据
    if (hasChanged(this._rawValue, newValue)) return;
    this._rawValue = newValue;
    this._value = newValue;
    //进行依赖的遍历触发
    triggerEffects(this.deps);
  }
}
/**
 * 描述：实现ref这个api的功能
 * @param { any } value 这个值可以是简单类型，也可以是个复杂类型
 * @return RefImp 实例化对象
 */
export function ref(value) {
  return new RefImp(value);
}
/**
 * 描述：判断当前数据是否是ref类型
 * @param { any } value 用来判断的值
 * @return boolean true表示是ref false表示不是ref
 */
export function isRef(value) {
  return !!value.__v_isRef;
}
/**
 * 描述：获取数据的真实值
 * @param { any } value 用来获取的值
 * @return any
 */
export function unRef(value) {
  return isRef(value) ? value.value : value;
}
/**
 * 描述：处理proxyRefs这个方法，用来去除ref的.value获值的，像template中即使不用.value也能获取到值
 * @param { any } 传入待处理的类型
 * @return Proxy
 */
export function proxyRefs(data) {
  // 根据测试用例，可以要考虑其获取值和设置值，并且还是响应式的。所以还是得考虑使用Proxy
  return new Proxy(data, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, newValue) {
      if (isRef(target[key]) && !isRef(newValue)) {
        return (target[key].value = newValue);
      } else {
        return Reflect.set(target, key, newValue);
      }
    },
  });
}
