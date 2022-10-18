import { provider } from "./apiInject";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";
import { proxyRefs } from "../reactivity";

/**
 * 描述：创建组件实例化对象
 * @param { any } vnode 虚拟dom
 * @return  object
 */
export function createComponentInstance(
  vnode: {
    type: any;
    props: any;
    children: any;
    el?: any;
    provider?: any;
    slots: any;
  },
  parent: any = {}
) {
  const component = {
    vnode,
    type: vnode.type,
    proxy: null,
    el: undefined,
    slots: {},
    parent: parent,
    provider: parent ? parent.provider : {},
    emit: () => {},
  };
  component.emit = emit.bind(null, component) as any;
  return component;
}
/**
 * 描述：处理组件的setup阶段逻辑
 * @param { any } instance
 * @return void
 */
export function setupComponent(instance: {
  vnode: {
    type: any;
    props: any;
    children: any;
    el?: any;
    slots: any;
  };
  type: any;
  proxy: any;
  provider: any;
}) {
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
function setupStatefulComponent(instance: {
  vnode: { type: any; props: any; children: any; setup?; el?: any };
  type: any;
  proxy: any;
  setupState?;
  props?;
  emit?;
  provider: any;
}) {
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
    handleSetupResult(instance, proxyRefs(setupResult));
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
let currentInstance = null;
/**
 * 描述：获取当前组件实例的方法
 * @return instance
 */
export function getCurrentInstance() {
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
