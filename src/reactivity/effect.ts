let shouldTrack;
class Effective {
  private _fn: any;
  public schedule: any;
  onStop: (() => void) | undefined;
  deps: Array<Set<any>> = [];
  private _active = true;
  constructor(fn, schedule?) {
    this._fn = fn;
    this.schedule = schedule;
  }
  run() {
    // 说明已经调用过stop了,那么我们不应该去收集
    if (!this._active) {
      return this._fn();
    }
    shouldTrack = true;
    activeEffect = this;
    // 为什么是调用之后，再将shouldTrack状态改为false呢,这样只要执行过一次收集之后就一直都是false了
    const result = this._fn();
    shouldTrack = false;
    return result;
  }
  stop() {
    // 需要将当前的effect从deps中移除,我们如何通过effect找到其对应的deps呢？需要在effect上记录一下当前的deps
    // 优化：调用多次stop时，也只清除一次
    if (this._active) {
      //为什么这里需要清空呢？因为effect传入的fn可能是动态的，当某些值发生改动的时候，可能已经不需要再和effect绑定了，所以先统一清空，当执行fn的响应式数据get时，又会进行收集
      cleanupEffect(this);
      // 调用stop的时候，会执行传入的onStop方法
      if (this.onStop) this.onStop();
      this._active = false;
    }
  }
}
/**
 * 描述：用来清空关于此effect的所有deps,这里的deps是一个数组是因为同样的一个effect实例可能绑定了多个响应式对象的值，所以我们需要将和它有关的都遍历一遍将自己删除
 *  例如：effect(()=>num = obj.count+obj.number)这里effect实例对应了两个变量，count和number.当我们effect不生效的时候，应该去count的Set和number的Set都将effect移除
 * @param { Effect } effect
 * @return void
 */
function cleanupEffect(effect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
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
  if (!isTracking()) return;
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
  /*
   * 描述：【优化】判断是否已经包含了activeEffect,若已经包含则不需要再次添加
   */
  if (!set.has(activeEffect)) {
    set.add(activeEffect);
    /*
     * 描述：[纠正]这里每个effect收集的deps是个数组，为什么会是一个数组呢？
     * 其他说明：
     */
    activeEffect.deps.push(set);
  }
}
/**
 * 描述：判断当前是否是可收集状态
 * @return boolean true表示可收集 false表示不可收集
 */
function isTracking() {
  // 如果当前不应该被收集，则直接返回，不执行下面的操作
  // 需要将当前的effect进行存储，所以定义一个全局的activeEffect
  return shouldTrack && activeEffect;
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
