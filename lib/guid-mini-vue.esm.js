function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
    };
    return component;
}
function setupComponent(instance) {
    // 处理props
    // 处理slot
    // 处理setup
    setupStatefulComponent(instance);
}
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

function render(vnode, container) {
    // 调用patch方法不断去处理容器和vnode之间的关系处理
    patch(vnode);
}
function patch(vnode, container) {
    // 判断vnode是什么类型的，是元素类型还是组件类型？由于我们优先处理的是根组件，所以先只考虑组件类型
    // processElement()
    processComponent(vnode);
}
function processComponent(vnode, container) {
    // 组件初始化状态的处理
    mountComponent(vnode);
    // 组件更新状态的处理
}
function mountComponent(vnode, container) {
    // 创建组件实例化对象;
    var instance = createComponentInstance(vnode);
    // 处理组件的setup中的属性挂载问题;
    setupComponent(instance);
    // 渲染组件内容;
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    var subTree = instance.render();
    patch(subTree);
}

function createVnode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
    };
    return vnode;
}

function createApp(rootComponent) {
    // 由于我们后续调用是在createApp(xxx).mount(xxx),所以返回一定是有mount方法的
    var mount = function (rootContainer) {
        document.querySelector(rootContainer);
        // 优先需要将传入的组件转换为vnode
        var vnode = createVnode(rootComponent);
        // 然后再将vnode插入到元素中去
        render(vnode);
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
