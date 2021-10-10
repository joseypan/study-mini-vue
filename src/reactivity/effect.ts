class ReactiveEffect {
    private _fn: () => void;
    deps = [];
    active=true;
    constructor(fn, public scheduler?) {
        this._fn = fn;
        this.scheduler=scheduler;
    }
    run() {
        currentEffect = this;
        return this._fn();
    }
    stop() {
        // 将当前的effect移除(需要从deps中移除effect)
        if(this.active){
            cleanupEffect(this);
            this.active=false
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect);
    })
};
// 依赖收集
const targetMap = new Map();
export const track = (target, key) => {
    //收集依赖的对应关系，一个响应式对象例如：{foo:1,name:'josey'},对应n各key,每一个key都有可能存在n个被依赖的关系，所以target对应key存在map关系,n个依赖关系是不能重复的，所以是set结构
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let deps = depsMap.get(key);
    if (!deps) {
        deps = new Set();
        depsMap.set(key, deps);
    }
    if(!currentEffect) return;
    deps.add(currentEffect);//需要将依赖进行收集，如何收集拿到fn呢？通过全局变量的形式，获取到当前的effect实例
    currentEffect.deps.push(deps)
}
// 触发依赖
export const trigger = (target, key) => {
    // 找到deps
    const depsMap = targetMap.get(target);
    const deps = depsMap.get(key);
    for (const effect of deps) {
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    }
}
let currentEffect;

//stop方法
export function stop(runner) {
    //runner中绑定了当前runner的effect
    runner.effect.stop();//执行实例中的stop方法
}

export const effect = (fn, options?: any) => {
    const scheduler = options?.scheduler;
    //接收一个fn,执行这个fn,才能拿到dependedFoo的初始值
    const _effect: any = new ReactiveEffect(fn, scheduler);
    _effect.run();
    let runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}