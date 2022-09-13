/**
 * 描述：创建组件实例化对象
 * @param { any } vnode 虚拟dom
 * @return  object
 */
export function createComponentInstance(vnode: {
  type: any;
  props: any;
  children: any;
}) {
  const component = {
    vnode,
    type: vnode.type,
  };
  return component;
}
/**
 * 描述：处理组件的setup阶段逻辑
 * @param { any } instance
 * @return void
 */
export function setupComponent(instance: {
  vnode: { type: any; props: any; children: any };
  type: any;
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
  vnode: { type: any; props: any; children: any; setup? };
  type: any;
}) {
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
