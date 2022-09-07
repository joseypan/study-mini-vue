import { render } from "./renderer";
import { createVnode } from "./vnode";
export function createApp(rootComponent) {
  // 由于我们后续调用是在createApp(xxx).mount(xxx),所以返回一定是有mount方法的
  const mount = (rootContainer) => {
    // 优先需要将传入的组件转换为vnode
    const vnode = createVnode(rootComponent);
    // 然后再将vnode插入到元素中去
    render(vnode, rootContainer);
  };
  return {
    mount,
  };
}
