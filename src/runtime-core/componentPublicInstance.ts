// 拓展：针对后续调用$el $data等等的优化
const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
};
export const PublicInstanceProxyHandlers = {
  get({ _instance: instance }, key) {
    const { setupState } = instance;
    if (key in setupState) {
      return setupState[key];
    }
    // 处理如果访问的是$el则返回组件根元素
    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
