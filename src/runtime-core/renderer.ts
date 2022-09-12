import { createComponentInstance, setupComponent } from "./component";

export function render(
  vnode: {
    type: any; // 由于我们后续调用是在createApp(xxx).mount(xxx),所以返回一定是有mount方法的
    props: any;
    children: any;
  },
  container: any
) {
  // 调用patch方法不断去处理容器和vnode之间的关系处理
  patch(vnode, container);
}
function patch(
  vnode: {
    type: any;
    props: any;
    children: any;
  },
  container: any
) {
  // 判断vnode是什么类型的，是元素类型还是组件类型？由于我们优先处理的是根组件，所以先只考虑组件类型
  // processElement()
  processComponent(vnode, container);
}

function processComponent(
  vnode: { type: any; props: any; children: any },
  container: any
) {
  // 组件初始化状态的处理
  mountComponent(vnode, container);
  // 组件更新状态的处理
}
function mountComponent(
  vnode: { type: any; props: any; children: any },
  container: any
) {
  // 创建组件实例化对象;
  const instance = createComponentInstance(vnode);
  // 处理组件的setup中的属性挂载问题;
  setupComponent(instance);
  // 渲染组件内容;
  setupRenderEffect(instance, container);
}
function setupRenderEffect(instance: any, container: any) {
  const subTree = instance.render();
  patch(subTree, container);
}
