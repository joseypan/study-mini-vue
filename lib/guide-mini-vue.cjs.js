'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * @FileDescription:用于公共处理的方法
 * @Author: 潘旭敏
 * @Date: 2022-08-09
 * @LastEditors: 潘旭敏
 * @LastEditTime:2022-08-09 00:02
 */
const isObject = (data) => {
    return data !== null && typeof data === "object";
};
/**
 * 描述：判断值是否发生改动
 * @param { any } rawValue newValue
 * @return boolean
 */
function hasChanged(rawValue, newValue) {
    return Object.is(rawValue, newValue);
}
/**
 * 描述：判断对象本身是否有该属性
 * @param { any } target 目标对象
 * @param { any } key 查询的属性key
 * @return boolean true表示包含该属性 false表示不包含该属性
 */
const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key);

// 用于存储所有的 effect 对象
function createDep(effects) {
    const dep = new Set(effects);
    return dep;
}

let shouldTrack;
class Effective {
    constructor(fn, schedule) {
        this.deps = [];
        this._active = true;
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
            if (this.onStop)
                this.onStop();
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
function effect(fn, options = {}) {
    const { schedule, onStop } = options;
    // 首先需要触发传入的fn，只有当触发了fn才会触发proxy的get方法,进行依赖收集
    const effectFn = new Effective(fn, schedule);
    // 后续只要是有属性都可以合并到实例化对象中去;
    Object.assign(effectFn, options);
    effectFn.run();
    const runner = effectFn.run.bind(effectFn);
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
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    // 判断是否有关于对象的map容器存放对应内容
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let set = depsMap.get(key);
    if (!set) {
        // 说明当前key还未收集，则需要重新创建一个Set结构
        set = createDep();
        depsMap.set(key, set);
    }
    trackEffects(set);
}
/**
 * 描述：处理Set结构存放依赖的方法
 * @param { Set } set 用来存放依赖收集的集合
 * @return void
 */
function trackEffects(set) {
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
    const deps = [];
    let depsMap = targetMap.get(target);
    if (!depsMap)
        return;
    const dep = depsMap.get(key);
    deps.push(dep);
    const effects = [];
    deps.forEach((ele) => {
        effects.push(...ele);
    });
    triggerEffects(createDep(effects));
}
/**
 * 描述：处理依赖触发的逻辑
 * @param { Set } set 收集到的依赖集合
 * @return void
 */
function triggerEffects(deps) {
    for (const dep of deps) {
        if (dep.schedule) {
            dep.schedule();
        }
        else {
            dep.run();
        }
    }
}

/*
 * 描述：为了防止get和set方法每次都重新声明，所以做优化，让其只初始化声明一次
 * 其他说明：
 */
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const readonlySet = createReadonlySetter();
const shallowReadonlyGet = createGetter(true, true);
/**
 * 描述：创建一个get方法
 * @param { boolean } isReadonly 是否是只读方法
 * @return ()=>any
 */
function createGetter(isReadonly = false, isShallow = false) {
    return function (target, key) {
        if (key === ObjectStatusEnum.IS_ACTIVE) {
            return !isReadonly;
        }
        else if (key === ObjectStatusEnum.IS_READONLY) {
            return isReadonly;
        }
        if (!isReadonly) {
            // 这里需要做依赖收集(只有当不是reandonly时候，才做依赖收集)
            track(target, key);
        }
        // 需要对获取到的值进行判断，判断其值是否是对象类型，如果是对象类型需要进一步的处理
        let result = Reflect.get(target, key);
        if (!isShallow && isObject(result)) {
            return isReadonly ? readonly(result) : reactive(result);
        }
        return result;
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
        console.warn(`当前key:${String(key)}不能被set,因为其是readonly,target:${target}`);
        return true;
    };
}
const mutableHandlers = {
    get,
    set,
};
const mutableReadonlyHandlers = {
    get: readonlyGet,
    set: readonlySet,
};
const mutableShallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set: readonlySet,
};

/*
 * 描述：定义数据状态的枚举值
 * 其他说明：
 */
var ObjectStatusEnum;
(function (ObjectStatusEnum) {
    /*
     * 描述：IS_ACTIVE表示当前数据是响应式数据
     */
    ObjectStatusEnum["IS_ACTIVE"] = "__is_active";
    /*
     * 描述：IS_READONLY表示当前数据是只读数据
     */
    ObjectStatusEnum["IS_READONLY"] = "__is_readonly";
})(ObjectStatusEnum || (ObjectStatusEnum = {}));
/**
 * 描述：声明响应式对象
 * @param { {[key:string]:any} } raw 普通对象
 * @return Proxy 响应式对象
 */
function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
/**
 * 描述：实现readonly方法
 * @param { {[key:string]:any} } raw 传入需要实现响应式的对象
 * @return Proxy 被Proxy代理过后的对象
 */
function readonly(raw) {
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
/**
 * 描述：创建一个shallowReadonly对象
 * @param { {[key:string]:any} } raw 传入需要实现响应式的对象
 * @return Proxy 被Proxy代理过后的对象
 */
function shallowReadonly(raw) {
    return createActiveObject(raw, mutableShallowReadonlyHandlers);
}

/*
 * 描述：声明一个类进行统一的ref相关操作，方便管理
 */
class RefImp {
    constructor(value) {
        this.__v_isRef = true;
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
        if (hasChanged(this._rawValue, newValue))
            return;
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
function ref(value) {
    return new RefImp(value);
}
/**
 * 描述：判断当前数据是否是ref类型
 * @param { any } value 用来判断的值
 * @return boolean true表示是ref false表示不是ref
 */
function isRef(value) {
    return !!value.__v_isRef;
}
/**
 * 描述：获取数据的真实值
 * @param { any } value 用来获取的值
 * @return any
 */
function unRef(value) {
    return isRef(value) ? value.value : value;
}
/**
 * 描述：处理proxyRefs这个方法，用来去除ref的.value获值的，像template中即使不用.value也能获取到值
 * @param { any } 传入待处理的类型
 * @return Proxy
 */
function proxyRefs(data) {
    // 根据测试用例，可以要考虑其获取值和设置值，并且还是响应式的。所以还是得考虑使用Proxy
    return new Proxy(data, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, newValue) {
            if (isRef(target[key]) && !isRef(newValue)) {
                return (target[key].value = newValue);
            }
            else {
                return Reflect.set(target, key, newValue);
            }
        },
    });
}

/**
 * @FileDescription:用来定义shapFlags相关枚举和逻辑
 * @Author: 潘旭敏
 * @Date: 2022-09-16
 * @LastEditors: 潘旭敏
 * @LastEditTime:2022-09-16 21:23
 */
var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["CHILDREN_TEXT"] = 4] = "CHILDREN_TEXT";
    ShapeFlags[ShapeFlags["CHILDREN_ARRAY"] = 8] = "CHILDREN_ARRAY";
    ShapeFlags[ShapeFlags["SLOT_CHILDREN"] = 16] = "SLOT_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));
// 100 -> 101

/**
 * @FileDescription:处理emit相关逻辑
 * @Author: 潘旭敏
 * @Date: 2022-09-21
 * @LastEditors: 潘旭敏
 * @LastEditTime:2022-09-21 21:49
 */
function emit(instance, event, ...args) {
    const { props } = instance;
    // 这个时候需要校验props上是否存在on + 大写+event出去首字母剩下的字母这样一个属性，如果有的话就调用
    const capitalize = (str) => {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
    };
    const convertEvent = (str) => {
        return str ? `on${capitalize(str)}` : "";
    };
    const camelize = (str) => {
        return str
            ? str.replace(/-(\w)/g, (_, letter) => {
                return letter.toUpperCase();
            })
            : "";
    };
    // 需要判断props上是否有，那么肯定需要拿到实例化对象，不然获取不到props
    const eventName = convertEvent(camelize(event));
    const eventFn = props[eventName];
    eventFn && eventFn(...args);
}

/**
 * 描述：初始化组件的props属性
 * @param { any } instance 组件实例对象
 * @return void
 */
function initProps(instance, props) {
    instance.props = props || {};
}

// 拓展：针对后续调用$el $data等等的优化
const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
};
const PublicInstanceProxyHandlers = {
    get({ _instance: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // 处理如果访问的是$el则返回组件根元素
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

/**
 * 描述：处理组件的slots
 * @param { any } instance 组件实例对象
 * @param { any } children 组件传入的子集
 * @return void
 */
function initSlots(instance, children) {
    // 这里进行一定的优化，不一定所有的children都有，或者是都是slots
    if (instance.vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        normalizeSlotObject(children, instance.slots);
    }
}
function normalizeSlotObject(children, slots) {
    // 这里的slots也要转成对象的形式
    for (const key in children) {
        slots[key] = (props) => {
            return normalizeSlotValue(children[key](props));
        };
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

/**
 * 描述：创建组件实例化对象
 * @param { any } vnode 虚拟dom
 * @return  object
 */
function createComponentInstance(vnode, parent = {}) {
    const component = {
        vnode,
        type: vnode.type,
        proxy: null,
        el: undefined,
        slots: {},
        parent: parent,
        provider: parent ? parent.provider : {},
        emit: () => { },
        isMounted: false,
        subTree: null,
        update: null,
        next: null,
    };
    component.emit = emit.bind(null, component);
    return component;
}
/**
 * 描述：处理组件的setup阶段逻辑
 * @param { any } instance
 * @return void
 */
function setupComponent(instance) {
    // 处理props
    initProps(instance, instance.vnode.props);
    // 处理slot
    initSlots(instance, instance.vnode.children);
    // 处理setup
    setupStatefulComponent(instance);
}
/**
 * 描述：处理有状态组件的setup逻辑
 * @param { any } instance 组件实例化对象
 * @return void
 */
function setupStatefulComponent(instance) {
    // 创建代理对象，用来收集组件的相关数据
    const proxy = new Proxy({ _instance: instance }, PublicInstanceProxyHandlers);
    // 并且需要将proxy对象绑定到instance上，其他地方才能够访问到
    instance.proxy = proxy;
    const { setup } = instance.type;
    if (setup) {
        // 给currentInstance赋值;
        setCurrentInstance(instance);
        // 只有当setup存在时才需要做处理
        // setup是一个function但是其返回值有两种形式，一种是object一种是function。优先只考虑object类型
        // setup方法的第二个参数是一个对象，对象中包含了emit，要使得当前可以访问到，需要把emit挂载在instance上
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        //调用完成setup之后就可以重置了
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        // 将setup中的属性挂载在实例对象上
        instance.setupState = proxyRefs(setupResult);
    }
    // 调用一个finishComponentSetup作为处理完setup的结束事件
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}
let currentInstance = null;
/**
 * 描述：获取当前组件实例的方法
 * @return instance
 */
function getCurrentInstance() {
    return currentInstance;
}
/**
 * 描述：设置组件实例（单独提取方法是为了后续好维护）
 * @param { any } instance
 * @return
 */
function setCurrentInstance(instance) {
    currentInstance = instance;
}

/*
 * 描述：创建Fragment类型
 */
const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
/**
 * 描述：创建虚拟dom
 * @param { object|string } type 节点的类型，如果是element就是string,如果是component就是object
 * @return object vnode
 */
function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        slots: {},
        key: props && props.key,
        shapeFlag: getShapeFlag(type),
        component: null, //instance实例
    };
    if (typeof children === "string") {
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.CHILDREN_TEXT;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.CHILDREN_ARRAY;
    }
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof children === "object") {
            vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.SLOT_CHILDREN;
        }
    }
    return vnode;
}
/**
 * 描述：创建Text类型的文本节点
 * @param { string } text 文本内容
 * @return
 */
function createTextVNode(text) {
    // 创建一个新节点，类型为Text，children为text
    return createVnode(Text, {}, text);
}
function getShapeFlag(type) {
    // 在创建vnode的时候决定当前是属于哪种类型
    return typeof type === "string"
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT;
}

function createAppAPI(render) {
    /**
     * 描述：创建App根元素内部的渲染内容
     * @param { any } rootComponent 根组件
     * @return Object {mount:fn} mount方法
     */
    return function createApp(rootComponent) {
        // 由于我们后续调用是在createApp(xxx).mount(xxx),所以返回一定是有mount方法的
        const mount = (rootContainer) => {
            const rootElement = document.querySelector(rootContainer);
            // 优先需要将传入的组件转换为vnode
            const vnode = createVnode(rootComponent);
            // 然后再将vnode插入到元素中去
            render(vnode, rootElement);
        };
        return {
            mount,
        };
    };
}

const shouldComponentUpdate = (prevVnode, nextVnode) => {
    //遍历新的vnode如果说两个不相等就返回false
    for (let key in nextVnode.props) {
        if (nextVnode.props[key] !== prevVnode.props[key]) {
            return true;
        }
    }
    return false;
};

// 相当于是创建了一个队列用来收集所有的更新,我们的目的是等到所有的更新都结束之后，我们再调用更新，可以节省性能消耗
// 这里牵扯了一个问题 同步任务 -> 微任务
// 微任务的执行顺序会晚于同一批次的同步任务，所以我们会先完成测试用例中的for循环，然后才会执行Promise.resolve().then的逻辑
const queue = [];
// 这里的逻辑设计很巧妙，我们在mountComponet的时候，调用effect会产生runner，然后后续无论添加多少次，传过来的job都是一样的
// 当做了去重处理之后，相当于在微任务队列中只会有唯一一个任务->所以最终只会调用一次
// 这样做可以实现，但是当我们想再次触发的时候，会发现已经触发不了了 -> 所以需要一个契机什么时候重置?
const queueJob = (job) => {
    //这里需要判断一下是否重复添加,若重复添加就不加入进去
    if (!queue.includes(job)) {
        queue.push(job);
        Promise.resolve().then(() => {
            console.log("promise调用");
            job();
        });
    }
};

function createRenderer(options) {
    const { createElement, patchProps, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, removeElementText: hostRemoveElementText, } = options;
    /**
     * 描述：处理虚拟dom渲染的逻辑
     * @param { any } vnode 虚拟dom
     * @param { any } container dom要插入到的dom容器在哪
     * @return
     */
    function render(vnode, container) {
        // 调用patch方法不断去处理容器和vnode之间的关系处理
        patch(null, vnode, container, null, null);
    }
    /**
     * 描述：处理渲染逻辑
     * @param { any } vnode 虚拟dom
     * @param { any } container dom要插入到的dom容器在哪
     * @return
     */
    function patch(prevVnode, vnode, container, parent, anchor) {
        const { type, shapeFlag } = vnode;
        // 判断vnode是什么类型的，是元素类型还是组件类型？由于我们优先处理的是根组件，所以先只考虑组件类型
        switch (type) {
            case Fragment:
                processFragment(prevVnode, vnode, container, parent, anchor);
                break;
            case Text:
                processText(prevVnode, vnode, container, anchor);
                break;
            default:
                // 这里逻辑与有值证明当前位上是有数据的
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(prevVnode, vnode, container, parent, anchor);
                }
                else {
                    processComponent(prevVnode, vnode, container, parent, anchor);
                }
                break;
        }
    }
    /**
     * 描述：处理组件的逻辑（包括初始化组件和更新组件）
     * @param { any } vnode 虚拟dom
     * @param { any } container dom要插入到的dom容器在哪
     * @return void
     */
    function processComponent(prevVnode, vnode, container, parent, anchor) {
        // 这里和processElement一样，需要判断一下当前是mount还是update
        if (!prevVnode) {
            // 组件初始化状态的处理
            mountComponent(vnode, container, parent, anchor);
        }
        else {
            // 组件更新状态的处理
            updateComponent(prevVnode, vnode);
        }
    }
    /**
     * 描述：处理更新组件的相关逻辑
     * @param { any } prevVnode 上一个节点
     * @param { any } vnode 当前节点
     * @return
     */
    function updateComponent(prevVnode, vnode) {
        const instance = (vnode.component = prevVnode.component);
        // 这里需要判断一下是否需要更新
        if (shouldComponentUpdate(prevVnode, vnode)) {
            console.log("should");
            // 我们更新Component无非是再次调用component.render让其下面的元素再次重新调用patch进行对比,这段逻辑和effect中的逻辑一致
            // 我们调用instance.update -> 如何根据vnode获取到instance呢?
            instance.next = vnode;
            instance.update();
        }
        else {
            vnode.el = prevVnode.el;
            instance.vnode = vnode;
        }
    }
    /**
     * 描述：初始化组件内容
     * @param { any } vnode 虚拟dom
     * @param { any } container dom要插入到的dom容器在哪
     * @return void
     */
    function mountComponent(vnode, container, parent, anchor) {
        // 创建组件实例化对象;
        const instance = (vnode.component = createComponentInstance(vnode, parent));
        // 处理组件的setup中的属性挂载问题;
        setupComponent(instance);
        // 渲染组件内容;
        setupRenderEffect(instance, container, anchor);
    }
    /**
     * 描述：在setup执行完之后处理组件渲染的逻辑
     * @param { any } instance 组件实例化对象
     * @return void
     */
    function setupRenderEffect(instance, container, anchor) {
        const componentUpdateFn = () => {
            //这里的逻辑需要优化一下,我们目前是完全同步的，但我们其实可以优化为等待同步执行完成之后再执行渲染操作
            console.log("setupRenderEffect");
            // 这里需要区分一下是第一次渲染的逻辑还是后续渲染的逻辑,给instance添加一个属性，isMounted
            if (!instance.isMounted) {
                // 这里在调用render的时候，需要把this指向proxy对象
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance, anchor);
                // 在所有元素的渲染之后再去获取vnode的第一项
                instance.vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    //这里有个问题在于，我们需要先更新props中的值，然后再调用instance.update()
                    updateComponentPreRender(instance, next);
                }
                // 这里其实是想要拿到上一次的subTree和这一次的subTree进行对比
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        };
        // 这里需要优化一下，目前相当于每次的修改都会触发effect的触发，但其实我们希望可以等其都触发完成了之后再进行最后的渲染
        instance.update = effect(componentUpdateFn, {
            schedule: () => {
                console.log("----schedule");
                queueJob(instance.update);
            },
        });
    }
    function updateComponentPreRender(instance, nextVnode) {
        //更新instance.vnode
        instance.vnode = nextVnode;
        instance.next = null;
        //更新props
        instance.props = nextVnode.props;
    }
    /**
     * 描述：处理虚拟dom类型是元素类型时的逻辑
     * @param { any } vnode 虚拟dom元素
     * @param { any } container 虚拟dom需要挂载的父节点元素
     * @return void
     */
    function processElement(prevVnode, vnode, container, parent, anchor) {
        // prevVnode不存在说明是初始化操作
        if (!prevVnode) {
            mountElement(vnode, container, parent, anchor);
        }
        else {
            patchElement(prevVnode, vnode, container, parent, anchor);
        }
    }
    /**
     * 描述：更新元素
     * @param {any} prevVnode 之前的节点
     * @param {any} vnode 现在的节点
     * @param {any} container 需要存放的容器
     * @param {any} parent 父节点元素
     * @param {any} anchor 需要插入的锚点位置
     * @return
     */
    function patchElement(prevVnode, vnode, container, parent, anchor) {
        const el = (vnode.el = prevVnode.el);
        updateProps(prevVnode, vnode, el);
        //更新children
        patchChildren(prevVnode, vnode, el, parent, anchor);
    }
    /**
     * 描述：处理children的更新逻辑
     * @param {  }
     * @return
     */
    function patchChildren(prevVnode, vnode, el, parent, anchor) {
        const prevShapeFlag = prevVnode.shapeFlag;
        const nextShapeFlag = vnode.shapeFlag;
        const prevChildren = prevVnode.children;
        const nextChildren = vnode.children;
        // 判断prevShapeFlag是不是children类型
        if (nextShapeFlag & ShapeFlags.CHILDREN_TEXT) {
            if (prevShapeFlag & ShapeFlags.CHILDREN_ARRAY) {
                unmounteChildren(prevChildren);
            }
            // 之前的节点也是text
            if (prevChildren !== nextChildren) {
                hostSetElementText(el, nextChildren);
            }
        }
        else {
            if (prevShapeFlag & ShapeFlags.CHILDREN_TEXT) {
                // text -> array
                hostRemoveElementText(el);
                // 渲染children元素
                mountChildren(nextChildren, el, parent, anchor);
            }
            else {
                // array -> array
                patchKeyedChildren(prevChildren, nextChildren, el, parent);
            }
        }
    }
    /**
     * 描述：处理array -> array的比较逻辑
     * @param {  }
     * @return
     */
    function patchKeyedChildren(prevChildren, nextChildren, container, parent) {
        let index = 0;
        const prevChildrenLength = prevChildren.length;
        const nextChildrenLength = nextChildren.length;
        let prevChildrenIndex = prevChildrenLength - 1;
        let nextChildrenIndex = nextChildrenLength - 1;
        // 比较两个vnode是否相等，如何比较呢？
        const isSameVNode = (n1, n2) => {
            return n1.type === n2.type && n1.key === n2.key;
        };
        // 先比较左端索引，修改index的值
        while (index <= prevChildrenIndex && index <= nextChildrenIndex) {
            if (isSameVNode(prevChildren[index], nextChildren[index])) {
                //相等的部分调用patch方法渲染
                patch(prevChildren[index], nextChildren[index], container, parent, null);
            }
            else {
                break;
            }
            index++;
        }
        // 比较右端索引，修改prevChildrenIndex和nextChildrenIndex
        while (index <= prevChildrenIndex && index <= nextChildrenIndex) {
            if (isSameVNode(prevChildren[prevChildrenIndex], nextChildren[nextChildrenIndex])) {
                patch(prevChildren[prevChildrenIndex], nextChildren[nextChildrenIndex], container, parent, null);
            }
            else {
                break;
            }
            prevChildrenIndex--;
            nextChildrenIndex--;
        }
        if (index > prevChildrenIndex) {
            //当前遍历的值大于了初始children
            if (index <= nextChildrenIndex) {
                //说明是新增元素(这里有一个问题，之前我们写patch方法的时候，都是使用的append,但是我们需要通过anchor进行insertBefore的元素插入)
                //这里的锚点如何计算呢? 假设是A B -> C A B的情况，index = 0;prevChildrenIndex = -1;nextChildrenIndex = 0;
                // 锚点元素应该是位于nextChildrenIndex+1位置的el
                const anchor = nextChildrenIndex + 1 < nextChildrenLength
                    ? nextChildren[nextChildrenIndex + 1].el
                    : null;
                while (index <= nextChildrenIndex) {
                    patch(null, nextChildren[index], container, parent, anchor);
                    index++;
                }
            }
        }
        else if (index > nextChildrenIndex) {
            if (index <= prevChildrenIndex) {
                // 说明是待删除的元素
                while (index <= prevChildrenIndex) {
                    hostRemove(prevChildren[index].el);
                    index++;
                }
            }
        }
        else {
            //中间部分
            //首先处理prevChildren中有，而nextChildren中没有的元素
            // 这里将nextChildren中的元素用Map进行收集，然后遍历prevChildren看是否有，如果没有的话就将此元素删除
            // 这里遍历的起始索引和结束索引排除掉之前已经进行对比的元素，仅仅是从index到nextChildrenIndex之间
            const nextKeyMap = new Map(); //这里的map存的key是key value是索引
            // 先收集新元素的key对应的Map
            for (let i = index; i <= nextChildrenIndex; i++) {
                //这里可能需要考虑一下没有key存在时的处理方式
                const key = nextChildren[i].key;
                nextKeyMap.set(key, i);
            }
            let nextOperatedCount = 0;
            const totalOperateCount = nextChildrenIndex - index + 1;
            const nextIndexToOldIndexMap = new Array(totalOperateCount).fill(-1);
            // 遍历prevChildren看看有没有已经需要删除的元素
            for (let i = index; i <= prevChildrenIndex; i++) {
                //这里有一个优化点，如果说数量已经超过了nextChildren的数量，那么一定都是删除操作了
                if (nextOperatedCount >= totalOperateCount) {
                    // 说明没有这一项，则需要调用删除
                    hostRemove(prevChildren[i].el);
                    continue;
                }
                const key = prevChildren[i].key;
                let nextIndex;
                //这里需要判断一下key是否为null或者undefined
                if (key !== null) {
                    nextIndex = nextKeyMap.get(key);
                }
                else {
                    //只能遍历判断了
                    for (let j = index; j <= nextChildrenIndex; j++) {
                        if (isSameVNode(prevChildren[i], nextChildren[j])) {
                            nextIndex = j;
                            break;
                        }
                    }
                }
                //说明在新的中没有找到
                if (nextIndex === undefined) {
                    // 说明没有这一项，则需要调用删除
                    hostRemove(prevChildren[i].el);
                }
                else {
                    // 说明存在，则需要判断是否有更新，若有更新的话则需要渲染新的
                    patch(prevChildren[i], nextChildren[nextIndex], container, parent, null);
                    nextIndexToOldIndexMap[nextIndex - index] = i;
                    nextOperatedCount++;
                }
            }
            const increasingNextIndexMap = getSequence(nextIndexToOldIndexMap);
            // 遍历需要处理变动的节点，判断是否需要移动
            // 这里其实是两个递增序列，进行分类
            const increasingNextIndexMapLength = increasingNextIndexMap.length;
            let increasingIndex = increasingNextIndexMapLength - 1;
            for (let i = totalOperateCount - 1; i >= 0; i--) {
                // 这里需要考虑一点，可能
                if (i !== increasingNextIndexMap[increasingIndex]) {
                    // 找到需要移动的元素，如何定位其插入的位置呢？
                    const nextIndex = i + index;
                    const anchor = nextIndex + 1 < nextChildrenLength
                        ? nextChildren[nextIndex + 1].el
                        : null;
                    hostInsert(nextChildren[nextIndex].el, container, anchor);
                }
                else {
                    //正常渲染即可
                    increasingIndex--;
                }
            }
        }
    }
    /**
     * 描述：删除元素
     * @param {  }
     * @return
     */
    function unmounteChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    /**
     * 描述： 处理更新时的props逻辑
     * @param {  }
     * @return
     */
    function updateProps(prevVnode, vnode, el) {
        const prevProps = prevVnode.props || {};
        const newProps = vnode.props || {};
        //遍历新的props,若当前key在老的props中也存在，且值不相同的，进行更新操作
        for (let key in newProps) {
            const prevProp = prevProps[key];
            const newProp = newProps[key];
            if (prevProp !== newProp) {
                patchProps(el, key, prevProp, newProp);
            }
        }
        for (let key in prevProps) {
            if (!(key in newProps)) {
                const prevProp = prevProps[key];
                patchProps(el, key, prevProp, null);
            }
        }
    }
    /**
     * 描述：初始化元素渲染逻辑
     * @param { any } vnode 虚拟dom元素
     * @param { any } container 虚拟dom需要挂载的父节点元素
     * @return void
     */
    function mountElement(vnode, container, parent, anchor) {
        const el = createElement(vnode.type);
        vnode.el = el;
        // 处理children
        const { children, props, shapeFlag } = vnode;
        if (shapeFlag & ShapeFlags.CHILDREN_TEXT) {
            // 说明是简单的文本形式
            el.innerText = children;
        }
        else if (shapeFlag & ShapeFlags.CHILDREN_ARRAY) {
            mountChildren(children, el, parent, anchor);
        }
        // 处理props(props传递是对象，所以需要遍历对象)
        for (let key in props) {
            const val = props[key];
            patchProps(el, key, null, val);
        }
        // 挂载
        hostInsert(el, container, anchor);
    }
    /**
     * 描述：处理虚拟dom存在子元素的情况
     * @param { any[] } children 子元素的虚拟dom集合
     * @param { any } container 子元素的虚拟dom所属父节点元素
     * @return void
     */
    function mountChildren(children, container, parent, anchor) {
        children.forEach((ele) => {
            patch(null, ele, container, parent, anchor);
        });
    }
    /**
     * 描述：处理Fragment类型节点渲染
     * @param { any } vnode
     * @param { HTMLElement } container
     * @return
     */
    function processFragment(prevVnode, vnode, container, parent, anchor) {
        //  调用mountChildren方法
        mountChildren(vnode.children, container, parent, anchor);
    }
    function processText(prevVnode, vnode, container, anchor) {
        const { children } = vnode;
        const textNode = document.createTextNode(children);
        // container.append(textNode);
        container.insertBefore(textNode, anchor || null);
    }
    return {
        createApp: createAppAPI(render),
    };
}
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

/**
 * @FileDescription:处理h函数创建虚拟dom逻辑
 * @Author: 潘旭敏
 * @Date: 2022-09-12
 * @LastEditors: 潘旭敏
 * @LastEditTime:2022-09-12 16:47
 */
function h(type, props, children) {
    return createVnode(type, props, children);
}

function renderSlots(slots, type, props) {
    let slot = slots[type];
    if (slot && typeof slot === "function") {
        return createVnode(Fragment, {}, slot(props));
    }
}

/**
 * 描述：provider data
 * @param { string } key 数据对应的key，后续要根据key进行数据查找
 * @return
 */
const provider = (key, data) => {
    const instance = getCurrentInstance();
    // 因为provider方法只在setup中存在，所以根据instance是否有值看在不在setup中
    if (!instance)
        return;
    // 从instance中获取到provider，给provider赋值
    let { provider } = instance;
    const parentProvider = instance.parent.provider;
    //希望通过原型链让当前instance.provider指向parentProvider
    // init
    if (provider === parentProvider) {
        provider = instance.provider = Object.create(parentProvider);
    }
    provider[key] = data;
};
/**
 * 描述：consumer data
 * @param { string } key 数据对应的key
 * @return
 */
const inject = (key, defaultValue) => {
    const instance = getCurrentInstance();
    const { parent } = instance;
    if (key in parent.provider) {
        return parent.provider[key];
    }
    else if (defaultValue) {
        if (typeof defaultValue === "function") {
            return defaultValue();
        }
        return defaultValue;
    }
};

// 这里用来实现createElement patchProps insert方法的具体实现
function createElement(type) {
    return document.createElement(type);
}
function patchProps(el, key, prevVal, val) {
    // 事件的格式是on+大写字母，当属性是以此开头的时候，默认是一个事件
    const isEvent = (key) => /^on[A-Z]/.test(key);
    if (isEvent(key)) {
        // 需要绑定在当前元素上，也就是vnode的el上
        const event = key.slice(2).toLocaleLowerCase();
        el.addEventListener(event, val);
    }
    else {
        if (val === null || val === undefined) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, val);
        }
    }
}
function insert(el, container, anchor) {
    // 挂载
    container.insertBefore(el, anchor || null);
}
function remove(child) {
    // 找到元素的父节点
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
function removeElementText(el) {
    el.textContent = "";
}
const renderer = createRenderer({
    createElement,
    patchProps,
    insert,
    remove,
    setElementText,
    removeElementText,
});
function createApp(...arg) {
    return renderer.createApp(...arg);
}

exports.createApp = createApp;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provider = provider;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
