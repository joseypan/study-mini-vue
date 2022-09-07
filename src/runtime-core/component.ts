export function createComponentInstance(vnode: {
  type: any;
  props: any;
  children: any;
}) {
  const component = {
    vnode,
  };
  return component;
}
export function setupComponent(instance: {
  vnode: { type: any; props: any; children: any };
}) {
  // 处理props
  // 处理slot
  // 处理setup
  setupStatefulComponent(instance);
}
function setupStatefulComponent(instance: {
  vnode: { type: any; props: any; children: any };
}) {
  const { setup } = instance.vnode.type;
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
  const Component = instance.vnode.type;
  if (Component.render) {
    instance.render = Component.render;
  }
}
