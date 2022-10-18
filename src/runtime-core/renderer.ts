import { effect } from "../reactivity/effect";
import { ShapeFlags } from "./../share/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";
export function createRenderer(options) {
  const { createElement, patchProps, insert } = options;
  /**
   * 描述：处理虚拟dom渲染的逻辑
   * @param { any } vnode 虚拟dom
   * @param { any } container dom要插入到的dom容器在哪
   * @return
   */
  function render(
    vnode: {
      type: any; // 由于我们后续调用是在createApp(xxx).mount(xxx),所以返回一定是有mount方法的
      props: any;
      children: any;
      el?: any;
      shapeFlag: any;
      slots: any;
    },
    container: any
  ) {
    // 调用patch方法不断去处理容器和vnode之间的关系处理
    patch(vnode, container, null);
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
      shapeFlag: any;
      slots: any;
    },
    container: any,
    parent: any
  ) {
    const { type, shapeFlag } = vnode;
    // 判断vnode是什么类型的，是元素类型还是组件类型？由于我们优先处理的是根组件，所以先只考虑组件类型
    switch (type) {
      case Fragment:
        processFragment(vnode, container, parent);
        break;
      case Text:
        processText(vnode, container);
        break;
      default:
        // 这里逻辑与有值证明当前位上是有数据的
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parent);
        } else {
          processComponent(vnode, container, parent);
        }
        break;
    }
  }
  /**
   * 描述：处理组件的逻辑（包括初始化组件和更新组件）
   * @param { any } vnode 虚拟dom
   * @param { any } container dom要插入到的dom容器在哪
   * @return void
   */
  function processComponent(
    vnode: { type: any; props: any; children: any; el?: any; slots: any },
    container: any,
    parent: any
  ) {
    // 组件初始化状态的处理
    mountComponent(vnode, container, parent);
    // 组件更新状态的处理
  }
  /**
   * 描述：初始化组件内容
   * @param { any } vnode 虚拟dom
   * @param { any } container dom要插入到的dom容器在哪
   * @return void
   */
  function mountComponent(
    vnode: { type: any; props: any; children: any; el?: any; slots: any },
    container: any,
    parent: any
  ) {
    // 创建组件实例化对象;
    const instance = createComponentInstance(vnode, parent);
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
    console.log("instance", instance);
    patch(subTree, container, instance);
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
    vnode: { type: any; props: any; children: any; el?; shapeFlag: any },
    container: any,
    parent: any
  ) {
    mountElement(vnode, container, parent);
  }
  /**
   * 描述：初始化元素渲染逻辑
   * @param { any } vnode 虚拟dom元素
   * @param { any } container 虚拟dom需要挂载的父节点元素
   * @return void
   */
  function mountElement(
    vnode: { type: any; props: any; children: any; el?; shapeFlag: any },
    container: any,
    parent: any
  ) {
    const el = createElement(vnode.type);
    vnode.el = el;
    // 处理children
    const { children, props, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.CHILDREN_TEXT) {
      // 说明是简单的文本形式
      el.innerText = children;
    } else if (shapeFlag & ShapeFlags.CHILDREN_ARRAY) {
      mountChildren(children, el, parent);
    }
    // 处理props(props传递是对象，所以需要遍历对象)
    for (let key in props) {
      const val = props[key];
      patchProps(el, key, val);
    }
    // 挂载
    insert(el, container);
  }
  /**
   * 描述：处理虚拟dom存在子元素的情况
   * @param { any[] } children 子元素的虚拟dom集合
   * @param { any } container 子元素的虚拟dom所属父节点元素
   * @return void
   */
  function mountChildren(children: any[], container: any, parent: any) {
    children.forEach((ele) => {
      patch(ele, container, parent);
    });
  }
  /**
   * 描述：处理Fragment类型节点渲染
   * @param { any } vnode
   * @param { HTMLElement } container
   * @return
   */
  function processFragment(vnode: any, container: HTMLElement, parent: any) {
    //  调用mountChildren方法
    mountChildren(vnode.children, container, parent);
  }
  function processText(vnode: any, container: HTMLElement) {
    const { children } = vnode;
    const textNode = document.createTextNode(children);
    container.append(textNode);
  }
  return {
    createApp: createAppAPI(render),
  };
}
