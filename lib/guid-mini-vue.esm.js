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
})(ShapeFlags || (ShapeFlags = {}));

// 拓展：针对后续调用$el $data等等的优化
var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
};
var PublicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._instance;
        var setupState = instance.setupState;
        if (key in setupState) {
            return setupState[key];
        }
        // 处理如果访问的是$el则返回组件根元素
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

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
    };
    return component;
}
/**
 * 描述：处理组件的setup阶段逻辑
 * @param { any } instance
 * @return void
 */
function setupComponent(instance) {
    // 处理props
    // 处理slot
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
        // 只有当setup存在时才需要做处理
        // setup是一个function但是其返回值有两种形式，一种是object一种是function。优先只考虑object类型
        var setupResult = setup();
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
    // 判断vnode是什么类型的，是元素类型还是组件类型？由于我们优先处理的是根组件，所以先只考虑组件类型
    var shapeFlag = vnode.shapeFlag;
    // 这里逻辑与有值证明当前位上是有数据的
    if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
    }
    else {
        processComponent(vnode, container);
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
        shapeFlag: getShapeFlag(type),
    };
    if (typeof children === "string") {
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.CHILDREN_TEXT;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.CHILDREN_ARRAY;
    }
    return vnode;
}
function getShapeFlag(type) {
    // 在创建vnode的时候决定当前是属于哪种类型
    return typeof type === "string"
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT;
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

export { createApp, h };
