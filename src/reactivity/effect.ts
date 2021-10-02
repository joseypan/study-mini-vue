class ReactiveEffect {
    private _fn: () => void;
    constructor(fn) {
        this._fn = fn;
    }
    run() {
        currentEffect=this;
        this._fn();
    }
}
// 依赖收集
const targetMap = new Map();
export const track = (target,key)=>{
    //收集依赖的对应关系，一个响应式对象例如：{foo:1,name:'josey'},对应n各key,每一个key都有可能存在n个被依赖的关系，所以target对应key存在map关系,n个依赖关系是不能重复的，所以是set结构
    let depsMap=targetMap.get(target);
    if(!depsMap){
        depsMap=new Map();
        targetMap.set(target,depsMap);
    }
    let deps = depsMap.get(key);
    if(!deps){
        deps=new Set();
        depsMap.set(key,deps);
    }
    deps.add(currentEffect);//需要将依赖进行收集，如何收集拿到fn呢？通过全局变量的形式，获取到当前的effect实例
}
// 触发依赖
export const trigger = (target,key)=>{
    // 找到deps
    const depsMap = targetMap.get(target);
    const deps = depsMap.get(key);
    for(const effect of deps){
        console.log(effect);
        effect.run();
    }
}
let currentEffect;
export const effect = (fn) => {
    //接收一个fn,执行这个fn,才能拿到dependedFoo的初始值
    const _effect = new ReactiveEffect(fn);
    _effect.run();
}