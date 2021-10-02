import {track,trigger} from './effect';
export const reactive = (target) => {
    const handler = {
        get: (target,key) => { 
            //收集依赖
            track(target,key);
            return Reflect.get(target,key);
        },
        set: (target,key,value) => { 
            //触发依赖
            let res=Reflect.set(target,key,value);
            trigger(target,key);
            return res;
        }
    }
    const proxy = new Proxy(target,handler);
    return proxy;
}