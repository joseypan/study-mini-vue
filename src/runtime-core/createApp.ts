import { render } from "./renderer";
import { createVnode } from "./vnode";
/**
 * 描述：创建App根元素内部的渲染内容
 * @param { any } rootComponent 根组件
 * @return Object {mount:fn} mount方法
 */
export function createApp(rootComponent) {
  // 由于我们后续调用是在createApp(xxx).mount(xxx),所以返回一定是有mount方法的
  const mount = (rootContainer) => {
    const rootElement = document.querySelector(rootContainer);
    // 优先需要将传入的组件转换为vnode
    const vnode = createVnode(rootComponent);
    // 然后再将vnode插入到元素中去
    render(vnode, rootElement);
  };
  return {
    mount,
  };
}
