/**
 * 描述：初始化组件的props属性
 * @param { any } instance 组件实例对象
 * @return void
 */
export function initProps(
  instance: {
    vnode: { type: any; props: any; children: any; el?: any };
    type: any;
    proxy: any;
    props?;
  },
  props: any
) {
  instance.props = props || {};
}
