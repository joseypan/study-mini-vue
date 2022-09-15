import { createComponentInstance, setupComponent } from "./component";
/**
 * 描述：处理虚拟dom渲染的逻辑
 * @param { any } vnode 虚拟dom
 * @param { any } container dom要插入到的dom容器在哪
 * @return
 */
export function render(
  vnode: {
    type: any; // 由于我们后续调用是在createApp(xxx).mount(xxx),所以返回一定是有mount方法的
    props: any;
    children: any;
    el?: any;
  },
  container: any
) {
  // 调用patch方法不断去处理容器和vnode之间的关系处理
  patch(vnode, container);
}
/**
 * 描述：处理渲染逻辑
 * @param { any } vnode 虚拟dom
 * @param { any } container dom要插入到的dom容器在哪
 * @return
 */
function patch(
  vnode: {
    type: any;
    props: any;
    children: any;
    el?: any;
  },
  container: any
) {
  // 判断vnode是什么类型的，是元素类型还是组件类型？由于我们优先处理的是根组件，所以先只考虑组件类型
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else {
    processComponent(vnode, container);
  }
}
/**
 * 描述：处理组件的逻辑（包括初始化组件和更新组件）
 * @param { any } vnode 虚拟dom
 * @param { any } container dom要插入到的dom容器在哪
 * @return void
 */
function processComponent(
  vnode: { type: any; props: any; children: any; el?: any },
  container: any
) {
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
function mountComponent(
  vnode: { type: any; props: any; children: any; el?: any },
  container: any
) {
  // 创建组件实例化对象;
  const instance = createComponentInstance(vnode);
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
function setupRenderEffect(instance: any, container: any) {
  // 这里在调用render的时候，需要把this指向proxy对象
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
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
function processElement(
  vnode: { type: any; props: any; children: any; el? },
  container: any
) {
  mountElement(vnode, container);
}
/**
 * 描述：初始化元素渲染逻辑
 * @param { any } vnode 虚拟dom元素
 * @param { any } container 虚拟dom需要挂载的父节点元素
 * @return void
 */
function mountElement(
  vnode: { type: any; props: any; children: any; el? },
  container: any
) {
  const el = document.createElement(vnode.type);
  vnode.el = el;
  // 处理children
  const { children, props } = vnode;
  if (typeof children === "string") {
    // 说明是简单的文本形式
    el.innerText = children;
  } else if (Array.isArray(children)) {
    mountChildren(children, el);
  }
  // 处理props(props传递是对象，所以需要遍历对象)
  for (let key in props) {
    const val = props[key];
    el.setAttribute(key, val);
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
function mountChildren(children: any[], container: any) {
  children.forEach((ele) => {
    patch(ele, container);
  });
}
