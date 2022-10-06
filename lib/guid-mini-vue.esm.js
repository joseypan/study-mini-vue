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

/**
 * @FileDescription:用于公共处理的方法
 * @Author: 潘旭敏
 * @Date: 2022-08-09
 * @LastEditors: 潘旭敏
 * @LastEditTime:2022-08-09 00:02
 */
var isObject = function (data) {
    return data !== null && typeof data === "object";
};
/**
 * 描述：判断对象本身是否有该属性
 * @param { any } target 目标对象
 * @param { any } key 查询的属性key
 * @return boolean true表示包含该属性 false表示不包含该属性
 */
var hasOwn = function (target, key) {
    return Object.prototype.hasOwnProperty.call(target, key);
};

/*
 * 描述：全局用来收集所有依赖的容器
 * 其他说明：这里使用weakmap是因为key是对象，且不会造成内存溢出
 */
var targetMap = new WeakMap();
/**
 * 描述：对依赖进行触发
 * @param { {[key:string]:any} } target 目标对象
 * @param { string } key 目标key
 * @return void
 */
function trigger(target, key) {
    var depsMap = targetMap.get(target);
    var set = depsMap.get(key);
    triggerEffects(set);
}
/**
 * 描述：处理依赖触发的逻辑
 * @param { Set } set 收集到的依赖集合
 * @return void
 */
function triggerEffects(set) {
    for (var _i = 0, set_1 = set; _i < set_1.length; _i++) {
        var key = set_1[_i];
        if (key.schedule) {
            key.schedule();
        }
        else {
            key.run();
        }
    }
}

/*
 * 描述：为了防止get和set方法每次都重新声明，所以做优化，让其只初始化声明一次
 * 其他说明：
 */
var get = createGetter();
var set = createSetter();
var readonlyGet = createGetter(true);
var readonlySet = createReadonlySetter();
var shallowReadonlyGet = createGetter(true, true);
/**
 * 描述：创建一个get方法
 * @param { boolean } isReadonly 是否是只读方法
 * @return ()=>any
 */
function createGetter(isReadonly, isShallow) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (isShallow === void 0) { isShallow = false; }
    return function (target, key) {
        if (key === ObjectStatusEnum.IS_ACTIVE) {
            return !isReadonly;
        }
        else if (key === ObjectStatusEnum.IS_READONLY) {
            return isReadonly;
        }
        // 需要对获取到的值进行判断，判断其值是否是对象类型，如果是对象类型需要进一步的处理
        var result = Reflect.get(target, key);
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
        console.warn("\u5F53\u524Dkey:".concat(String(key), "\u4E0D\u80FD\u88ABset,\u56E0\u4E3A\u5176\u662Freadonly,target:").concat(target));
        return true;
    };
}
var mutableHandlers = {
    get: get,
    set: set,
};
var mutableReadonlyHandlers = {
    get: readonlyGet,
    set: readonlySet,
};
var mutableShallowReadonlyHandlers = {
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

/**
 * @FileDescription:处理emit相关逻辑
 * @Author: 潘旭敏
 * @Date: 2022-09-21
 * @LastEditors: 潘旭敏
 * @LastEditTime:2022-09-21 21:49
 */
function emit(instance, event) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var props = instance.props;
    // 这个时候需要校验props上是否存在on + 大写+event出去首字母剩下的字母这样一个属性，如果有的话就调用
    var capitalize = function (str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
    };
    var convertEvent = function (str) {
        return str ? "on".concat(capitalize(str)) : "";
    };
    var camelize = function (str) {
        return str
            ? str.replace(/-(\w)/g, function (_, letter) {
                return letter.toUpperCase();
            })
            : "";
    };
    // 需要判断props上是否有，那么肯定需要拿到实例化对象，不然获取不到props
    var eventName = convertEvent(camelize(event));
    var eventFn = props[eventName];
    eventFn && eventFn.apply(void 0, args);
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
var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
    $slots: function (i) { return i.slots; },
};
var PublicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._instance;
        var setupState = instance.setupState, props = instance.props;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // 处理如果访问的是$el则返回组件根元素
        var publicGetter = publicPropertiesMap[key];
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
    var _loop_1 = function (key) {
        slots[key] = function (props) {
            return normalizeSlotValue(children[key](props));
        };
    };
    // 这里的slots也要转成对象的形式
    for (var key in children) {
        _loop_1(key);
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
function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        proxy: null,
        el: undefined,
        slots: {},
        emit: function () { },
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
    var proxy = new Proxy({ _instance: instance }, PublicInstanceProxyHandlers);
    // 并且需要将proxy对象绑定到instance上，其他地方才能够访问到
    instance.proxy = proxy;
    var setup = instance.type.setup;
    if (setup) {
        // 给currentInstance赋值;
        setCurrentInstance(instance);
        // 只有当setup存在时才需要做处理
        // setup是一个function但是其返回值有两种形式，一种是object一种是function。优先只考虑object类型
        // setup方法的第二个参数是一个对象，对象中包含了emit，要使得当前可以访问到，需要把emit挂载在instance上
        var setupResult = setup(shallowReadonly(instance.props), {
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
        instance.setupState = setupResult;
    }
    // 调用一个finishComponentSetup作为处理完setup的结束事件
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var Component = instance.type;
    instance.render = Component.render;
}
var currentInstance = null;
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
var Fragment = Symbol("Fragment");
var Text = Symbol("Text");
/**
 * 描述：创建虚拟dom
 * @param { object|string } type 节点的类型，如果是element就是string,如果是component就是object
 * @return object vnode
 */
function createVnode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        el: null,
        slots: {},
        shapeFlag: getShapeFlag(type),
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

/**
 * 描述：处理虚拟dom渲染的逻辑
 * @param { any } vnode 虚拟dom
 * @param { any } container dom要插入到的dom容器在哪
 * @return
 */
function render(vnode, container) {
    // 调用patch方法不断去处理容器和vnode之间的关系处理
    patch(vnode, container);
}
/**
 * 描述：处理渲染逻辑
 * @param { any } vnode 虚拟dom
 * @param { any } container dom要插入到的dom容器在哪
 * @return
 */
function patch(vnode, container) {
    var type = vnode.type, shapeFlag = vnode.shapeFlag;
    // 判断vnode是什么类型的，是元素类型还是组件类型？由于我们优先处理的是根组件，所以先只考虑组件类型
    switch (type) {
        case Fragment:
            processFragment(vnode, container);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            // 这里逻辑与有值证明当前位上是有数据的
            if (shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container);
            }
            else {
                processComponent(vnode, container);
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
function processComponent(vnode, container) {
    // 组件初始化状态的处理
    mountComponent(vnode, container);
    // 组件更新状态的处理
}
/**
 * 描述：初始化组件内容
 * @param { any } vnode 虚拟dom
 * @param { any } container dom要插入到的dom容器在哪
 * @return void
 */
function mountComponent(vnode, container) {
    // 创建组件实例化对象;
    var instance = createComponentInstance(vnode);
    // 处理组件的setup中的属性挂载问题;
    setupComponent(instance);
    // 渲染组件内容;
    setupRenderEffect(instance, container);
}
/**
 * 描述：在setup执行完之后处理组件渲染的逻辑
 * @param { any } instance 组件实例化对象
 * @return void
 */
function setupRenderEffect(instance, container) {
    // 这里在调用render的时候，需要把this指向proxy对象
    var proxy = instance.proxy;
    var subTree = instance.render.call(proxy);
    patch(subTree, container);
    // 在所有元素的渲染之后再去获取vnode的第一项
    instance.vnode.el = subTree.el;
}
/**
 * 描述：处理虚拟dom类型是元素类型时的逻辑
 * @param { any } vnode 虚拟dom元素
 * @param { any } container 虚拟dom需要挂载的父节点元素
 * @return void
 */
function processElement(vnode, container) {
    mountElement(vnode, container);
}
/**
 * 描述：初始化元素渲染逻辑
 * @param { any } vnode 虚拟dom元素
 * @param { any } container 虚拟dom需要挂载的父节点元素
 * @return void
 */
function mountElement(vnode, container) {
    var el = document.createElement(vnode.type);
    vnode.el = el;
    // 处理children
    var children = vnode.children, props = vnode.props, shapeFlag = vnode.shapeFlag;
    if (shapeFlag & ShapeFlags.CHILDREN_TEXT) {
        // 说明是简单的文本形式
        el.innerText = children;
    }
    else if (shapeFlag & ShapeFlags.CHILDREN_ARRAY) {
        mountChildren(children, el);
    }
    // 处理props(props传递是对象，所以需要遍历对象)
    for (var key in props) {
        var val = props[key];
        // 事件的格式是on+大写字母，当属性是以此开头的时候，默认是一个事件
        var isEvent = function (key) { return /^on[A-Z]/.test(key); };
        if (isEvent(key)) {
            // 需要绑定在当前元素上，也就是vnode的el上
            var event_1 = key.slice(2).toLocaleLowerCase();
            el.addEventListener(event_1, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    // 挂载
    container.append(el);
}
/**
 * 描述：处理虚拟dom存在子元素的情况
 * @param { any[] } children 子元素的虚拟dom集合
 * @param { any } container 子元素的虚拟dom所属父节点元素
 * @return void
 */
function mountChildren(children, container) {
    children.forEach(function (ele) {
        patch(ele, container);
    });
}
/**
 * 描述：处理Fragment类型节点渲染
 * @param { any } vnode
 * @param { HTMLElement } container
 * @return
 */
function processFragment(vnode, container) {
    //  调用mountChildren方法
    mountChildren(vnode.children, container);
}
function processText(vnode, container) {
    var children = vnode.children;
    var textNode = document.createTextNode(children);
    container.append(textNode);
}

/**
 * 描述：创建App根元素内部的渲染内容
 * @param { any } rootComponent 根组件
 * @return Object {mount:fn} mount方法
 */
function createApp(rootComponent) {
    // 由于我们后续调用是在createApp(xxx).mount(xxx),所以返回一定是有mount方法的
    var mount = function (rootContainer) {
        var rootElement = document.querySelector(rootContainer);
        // 优先需要将传入的组件转换为vnode
        var vnode = createVnode(rootComponent);
        // 然后再将vnode插入到元素中去
        render(vnode, rootElement);
    };
    return {
        mount: mount,
    };
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
    var slot = slots[type];
    if (slot && typeof slot === "function") {
        return createVnode(Fragment, {}, slot(props));
    }
}

export { createApp, createTextVNode, getCurrentInstance, h, renderSlots };
