import { Effective } from "./effect";
class ComputedImpl {
  private _getter: any;
  private _dirty: boolean = false;
  private _value: any;
  private _effect: Effective;
  constructor(getter) {
    this._getter = getter;
    this._effect = new Effective(getter, () => {
      this._dirty = false;
    });
  }
  /*
   * 描述：当调用cValue.value的时候就会触发方法，这个时候我们再进行方法的调用
   */
  get value() {
    if (!this._dirty) {
      this._dirty = true;
      this._value = this._effect.run();
    }
    return this._value;
  }
}
/**
 * 描述：定义computed方法
 * @param { ()=>any } getter 传入的方法
 * @return ComputedImpl
 */
export function computed(getter) {
  /*
   * 描述：这里使用一个类的实例化对象是因为我们需要value的get方法的触发
   */
  return new ComputedImpl(getter);
}
