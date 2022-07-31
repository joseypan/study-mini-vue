class Effective {
  private _fn: any;
  public schedule: any;
  onStop: (() => void) | undefined;
  deps: Set<any> = new Set();
  private _active = true;
  constructor(fn, schedule?) {
    this._fn = fn;
    this.schedule = schedule;
  }
  run() {
    activeEffect = this;
    return this._fn();
  }
  stop() {
    // 需要将当前的effect从deps中移除,我们如何通过effect找到其对应的deps呢？需要在effect上记录一下当前的deps
    // 优化：调用多次stop时，也只清除一次
    if (this._active) {
      this.deps.delete(this);
      // 调用stop的时候，会执行传入的onStop方法
      if (this.onStop) this.onStop();
      this._active = false;
    }
  }
}
/**
 * 描述：effect方法作为响应式数据依赖的入口方法
 * @param { Function } fn 传入的响应式数据相关的方法
 * @return void
 */
function effect(fn, options: any = {}) {
  const { schedule, onStop } = options;
  // 首先需要触发传入的fn，只有当触发了fn才会触发proxy的get方法,进行依赖收集
  const effectFn = new Effective(fn, schedule);
  // 后续只要是有属性都可以合并到实例化对象中去;
  Object.assign(effectFn, options);
  effectFn.run();
  const runner: any = effectFn.run.bind(effectFn);
  runner.effect = effectFn;
  return runner;
}
/*
 * 描述：全局用来收集所有依赖的容器
 * 其他说明：这里使用weakmap是因为key是对象，且不会造成内存溢出
 */
const targetMap = new WeakMap();
/*
 * 描述：全局表示当前effect
 * 其他说明：
 */
let activeEffect;
/**
 * 描述：对依赖进行相对应的收集
 * @param {  }
 * @return
 */
function track(target, key) {
  let depsMap = targetMap.get(target);
  // 判断是否有关于对象的map容器存放对应内容
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let set = depsMap.get(key);
  if (!set) {
    // 说明当前key还未收集，则需要重新创建一个Set结构
    set = new Set();
    depsMap.set(key, set);
  }
  // 需要将当前的effect进行存储，所以定义一个全局的activeEffect
  if (!activeEffect) return;
  set.add(activeEffect);
  activeEffect.deps = set;
}
/**
 * 描述：对依赖进行触发
 * @param { {[key:string]:any} } target 目标对象
 * @param { string } key 目标key
 * @return void
 */
function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let set = depsMap.get(key);
  for (let key of set) {
    if (key.schedule) {
      key.schedule();
    } else {
      key.run();
    }
  }
}
/**
 * 描述：实现一个stop方法，该方法传入runner，需要清除响应式的触发
 * @param {  } runner 调用effect之后返回的函数
 * @return
 */
const stop = (runner) => {
  // 我们要实现响应式对象改动之后，不执行effect，就要看trigger是如何实现的
  // trigger的触发是根据key找到对应的deps进行遍历，然后逐个执行里面的run方法
  // 换句话说，我是不是只要通过stop方法的执行，将effect从deps中移除，那么后续即使遍历去触发run方法的时候就不会执行了
  // 现在的问题在于，我们只接收一个runner方法，如何通过runner找到其对应的effect?所以需要在runner方法上挂载一个属性，这个属性的值就是effect
  runner.effect.stop();
};
export { effect, track, trigger, stop };
