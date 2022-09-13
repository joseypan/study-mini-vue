/**
 * 描述：创建组件实例化对象
 * @param { any } vnode 虚拟dom
 * @return  object
 */
function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
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
    if (typeof vnode.type === "string") {
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
    var subTree = instance.render();
    patch(subTree, container);
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    var el = document.createElement(vnode.type);
    // 处理children
    var children = vnode.children, props = vnode.props;
    if (typeof children === "string") {
        // 说明是简单的文本形式
        el.innerText = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(children, el);
    }
    // 处理props(props传递是对象，所以需要遍历对象)
    for (var key in props) {
        var val = props[key];
        el.setAttribute(key, val);
    }
    // 挂载
    container.append(el);
}
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
    };
    return vnode;
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
