import { createRenderer } from "../runtime-core/renderer";

// 这里用来实现createElement patchProps insert方法的具体实现
function createElement(type) {
  return document.createElement(type);
}

function patchProps(el, key, val) {
  // 事件的格式是on+大写字母，当属性是以此开头的时候，默认是一个事件
  const isEvent = (key) => /^on[A-Z]/.test(key);
  if (isEvent(key)) {
    // 需要绑定在当前元素上，也就是vnode的el上
    const event = key.slice(2).toLocaleLowerCase();
    el.addEventListener(event, val);
  } else {
    el.setAttribute(key, val);
  }
}

function insert(el, container) {
  // 挂载
  container.append(el);
}

const renderer: any = createRenderer({
  createElement,
  patchProps,
  insert,
});

export function createApp(...arg) {
  return renderer.createApp(...arg);
}

export * from "../runtime-core";
