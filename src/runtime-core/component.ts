import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

/**
 * 描述：创建组件实例化对象
 * @param { any } vnode 虚拟dom
 * @return  object
 */
export function createComponentInstance(vnode: {
  type: any;
  props: any;
  children: any;
  el?: any;
}) {
  const component = {
    vnode,
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
export function setupComponent(instance: {
  vnode: { type: any; props: any; children: any; el?: any };
  type: any;
  proxy: any;
}) {
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
function setupStatefulComponent(instance: {
  vnode: { type: any; props: any; children: any; setup?; el?: any };
  type: any;
  proxy: any;
  setupState?;
}) {
  // 创建代理对象，用来收集组件的相关数据
  const proxy = new Proxy({ _instance: instance }, PublicInstanceProxyHandlers);
  // 并且需要将proxy对象绑定到instance上，其他地方才能够访问到
  instance.proxy = proxy;
  const { setup } = instance.type;
  if (setup) {
    // 只有当setup存在时才需要做处理
    // setup是一个function但是其返回值有两种形式，一种是object一种是function。优先只考虑object类型
    const setupResult = setup();
    handleSetupResult(instance, setupResult);
  }
}
function handleSetupResult(instance: any, setupResult: any) {
  if (typeof setupResult === "object") {
    // 将setup中的属性挂载在实例对象上
    instance.setupState = setupResult;
  }
  // 调用一个finishComponentSetup作为处理完setup的结束事件
  finishComponentSetup(instance);
}
function finishComponentSetup(instance: any) {
  const Component = instance.type;
  instance.render = Component.render;
}
