import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../share/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";
import { shouldComponentUpdate } from "./helpers/componentUpdateUtils";
import { queueJob } from "./schedule";
export function createRenderer(options) {
  const {
    createElement,
    patchProps,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    removeElementText: hostRemoveElementText,
  } = options;
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
    patch(null, vnode, container, null, null);
  }
  /**
   * 描述：处理渲染逻辑
   * @param { any } vnode 虚拟dom
   * @param { any } container dom要插入到的dom容器在哪
   * @return
   */
  function patch(
    prevVnode: any,
    vnode: {
      type: any;
      props: any;
      children: any;
      el?: any;
      shapeFlag: any;
      slots: any;
    },
    container: any,
    parent: any,
    anchor: any
  ) {
    const { type, shapeFlag } = vnode;
    // 判断vnode是什么类型的，是元素类型还是组件类型？由于我们优先处理的是根组件，所以先只考虑组件类型
    switch (type) {
      case Fragment:
        processFragment(prevVnode, vnode, container, parent, anchor);
        break;
      case Text:
        processText(prevVnode, vnode, container, anchor);
        break;
      default:
        // 这里逻辑与有值证明当前位上是有数据的
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(prevVnode, vnode, container, parent, anchor);
        } else {
          processComponent(prevVnode, vnode, container, parent, anchor);
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
    prevVnode: any,
    vnode: { type: any; props: any; children: any; el?: any; slots: any },
    container: any,
    parent: any,
    anchor: any
  ) {
    // 这里和processElement一样，需要判断一下当前是mount还是update
    if (!prevVnode) {
      // 组件初始化状态的处理
      mountComponent(vnode, container, parent, anchor);
    } else {
      // 组件更新状态的处理
      updateComponent(prevVnode, vnode);
    }
  }
  /**
   * 描述：处理更新组件的相关逻辑
   * @param { any } prevVnode 上一个节点
   * @param { any } vnode 当前节点
   * @return
   */
  function updateComponent(prevVnode, vnode) {
    const instance = (vnode.component = prevVnode.component);
    // 这里需要判断一下是否需要更新
    if (shouldComponentUpdate(prevVnode, vnode)) {
      console.log("should");
      // 我们更新Component无非是再次调用component.render让其下面的元素再次重新调用patch进行对比,这段逻辑和effect中的逻辑一致
      // 我们调用instance.update -> 如何根据vnode获取到instance呢?
      instance.next = vnode;
      instance.update();
    } else {
      vnode.el = prevVnode.el;
      instance.vnode = vnode;
    }
  }
  /**
   * 描述：初始化组件内容
   * @param { any } vnode 虚拟dom
   * @param { any } container dom要插入到的dom容器在哪
   * @return void
   */
  function mountComponent(
    vnode: any,
    container: any,
    parent: any,
    anchor: any
  ) {
    // 创建组件实例化对象;
    const instance = (vnode.component = createComponentInstance(vnode, parent));
    // 处理组件的setup中的属性挂载问题;
    setupComponent(instance);
    // 渲染组件内容;
    setupRenderEffect(instance, container, anchor);
  }
  /**
   * 描述：在setup执行完之后处理组件渲染的逻辑
   * @param { any } instance 组件实例化对象
   * @return void
   */
  function setupRenderEffect(instance: any, container: any, anchor: any) {
    const componentUpdateFn = () => {
      //这里的逻辑需要优化一下,我们目前是完全同步的，但我们其实可以优化为等待同步执行完成之后再执行渲染操作
      console.log("setupRenderEffect");
      // 这里需要区分一下是第一次渲染的逻辑还是后续渲染的逻辑,给instance添加一个属性，isMounted
      if (!instance.isMounted) {
        // 这里在调用render的时候，需要把this指向proxy对象
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        patch(null, subTree, container, instance, anchor);
        // 在所有元素的渲染之后再去获取vnode的第一项
        instance.vnode.el = subTree.el;
        instance.isMounted = true;
      } else {
        const { next, vnode } = instance;
        if (next) {
          next.el = vnode.el;
          //这里有个问题在于，我们需要先更新props中的值，然后再调用instance.update()
          updateComponentPreRender(instance, next);
        }
        // 这里其实是想要拿到上一次的subTree和这一次的subTree进行对比
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;
        instance.subTree = subTree;
        patch(prevSubTree, subTree, container, instance, anchor);
      }
    };
    // 这里需要优化一下，目前相当于每次的修改都会触发effect的触发，但其实我们希望可以等其都触发完成了之后再进行最后的渲染
    instance.update = effect(componentUpdateFn, {
      schedule: () => {
        console.log("----schedule");
        queueJob(instance.update);
      },
    });
  }
  function updateComponentPreRender(instance, nextVnode) {
    //更新instance.vnode
    instance.vnode = nextVnode;
    instance.next = null;
    //更新props
    instance.props = nextVnode.props;
  }
  /**
   * 描述：处理虚拟dom类型是元素类型时的逻辑
   * @param { any } vnode 虚拟dom元素
   * @param { any } container 虚拟dom需要挂载的父节点元素
   * @return void
   */
  function processElement(
    prevVnode: any,
    vnode: { type: any; props: any; children: any; el?; shapeFlag: any },
    container: any,
    parent: any,
    anchor: any
  ) {
    // prevVnode不存在说明是初始化操作
    if (!prevVnode) {
      mountElement(vnode, container, parent, anchor);
    } else {
      patchElement(prevVnode, vnode, container, parent, anchor);
    }
  }
  /**
   * 描述：更新元素
   * @param {any} prevVnode 之前的节点
   * @param {any} vnode 现在的节点
   * @param {any} container 需要存放的容器
   * @param {any} parent 父节点元素
   * @param {any} anchor 需要插入的锚点位置
   * @return
   */
  function patchElement(
    prevVnode: any,
    vnode: any,
    container: any,
    parent,
    anchor
  ) {
    const el = (vnode.el = prevVnode.el);
    updateProps(prevVnode, vnode, el);
    //更新children
    patchChildren(prevVnode, vnode, el, parent, anchor);
  }
  /**
   * 描述：处理children的更新逻辑
   * @param {  }
   * @return
   */
  function patchChildren(prevVnode, vnode, el, parent, anchor) {
    const prevShapeFlag = prevVnode.shapeFlag;
    const nextShapeFlag = vnode.shapeFlag;
    const prevChildren = prevVnode.children;
    const nextChildren = vnode.children;
    // 判断prevShapeFlag是不是children类型
    if (nextShapeFlag & ShapeFlags.CHILDREN_TEXT) {
      if (prevShapeFlag & ShapeFlags.CHILDREN_ARRAY) {
        unmounteChildren(prevChildren);
      }
      // 之前的节点也是text
      if (prevChildren !== nextChildren) {
        hostSetElementText(el, nextChildren);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.CHILDREN_TEXT) {
        // text -> array
        hostRemoveElementText(el);
        // 渲染children元素
        mountChildren(nextChildren, el, parent, anchor);
      } else {
        // array -> array
        patchKeyedChildren(prevChildren, nextChildren, el, parent);
      }
    }
  }
  /**
   * 描述：处理array -> array的比较逻辑
   * @param {  }
   * @return
   */
  function patchKeyedChildren(prevChildren, nextChildren, container, parent) {
    let index = 0;
    const prevChildrenLength = prevChildren.length;
    const nextChildrenLength = nextChildren.length;
    let prevChildrenIndex = prevChildrenLength - 1;
    let nextChildrenIndex = nextChildrenLength - 1;
    // 比较两个vnode是否相等，如何比较呢？
    const isSameVNode = (n1, n2) => {
      return n1.type === n2.type && n1.key === n2.key;
    };
    // 先比较左端索引，修改index的值
    while (index <= prevChildrenIndex && index <= nextChildrenIndex) {
      if (isSameVNode(prevChildren[index], nextChildren[index])) {
        //相等的部分调用patch方法渲染
        patch(
          prevChildren[index],
          nextChildren[index],
          container,
          parent,
          null
        );
      } else {
        break;
      }
      index++;
    }
    // 比较右端索引，修改prevChildrenIndex和nextChildrenIndex
    while (index <= prevChildrenIndex && index <= nextChildrenIndex) {
      if (
        isSameVNode(
          prevChildren[prevChildrenIndex],
          nextChildren[nextChildrenIndex]
        )
      ) {
        patch(
          prevChildren[prevChildrenIndex],
          nextChildren[nextChildrenIndex],
          container,
          parent,
          null
        );
      } else {
        break;
      }
      prevChildrenIndex--;
      nextChildrenIndex--;
    }
    if (index > prevChildrenIndex) {
      //当前遍历的值大于了初始children
      if (index <= nextChildrenIndex) {
        //说明是新增元素(这里有一个问题，之前我们写patch方法的时候，都是使用的append,但是我们需要通过anchor进行insertBefore的元素插入)
        //这里的锚点如何计算呢? 假设是A B -> C A B的情况，index = 0;prevChildrenIndex = -1;nextChildrenIndex = 0;
        // 锚点元素应该是位于nextChildrenIndex+1位置的el
        const anchor =
          nextChildrenIndex + 1 < nextChildrenLength
            ? nextChildren[nextChildrenIndex + 1].el
            : null;
        while (index <= nextChildrenIndex) {
          patch(null, nextChildren[index], container, parent, anchor);
          index++;
        }
      }
    } else if (index > nextChildrenIndex) {
      if (index <= prevChildrenIndex) {
        // 说明是待删除的元素
        while (index <= prevChildrenIndex) {
          hostRemove(prevChildren[index].el);
          index++;
        }
      }
    } else {
      //中间部分
      //首先处理prevChildren中有，而nextChildren中没有的元素
      // 这里将nextChildren中的元素用Map进行收集，然后遍历prevChildren看是否有，如果没有的话就将此元素删除
      // 这里遍历的起始索引和结束索引排除掉之前已经进行对比的元素，仅仅是从index到nextChildrenIndex之间
      const nextKeyMap = new Map(); //这里的map存的key是key value是索引
      // 先收集新元素的key对应的Map
      for (let i = index; i <= nextChildrenIndex; i++) {
        //这里可能需要考虑一下没有key存在时的处理方式
        const key = nextChildren[i].key;
        nextKeyMap.set(key, i);
      }
      let nextOperatedCount = 0;
      const totalOperateCount = nextChildrenIndex - index + 1;
      const nextIndexToOldIndexMap = new Array(totalOperateCount).fill(-1);
      // 遍历prevChildren看看有没有已经需要删除的元素
      for (let i = index; i <= prevChildrenIndex; i++) {
        //这里有一个优化点，如果说数量已经超过了nextChildren的数量，那么一定都是删除操作了
        if (nextOperatedCount >= totalOperateCount) {
          // 说明没有这一项，则需要调用删除
          hostRemove(prevChildren[i].el);
          continue;
        }
        const key = prevChildren[i].key;
        let nextIndex;
        //这里需要判断一下key是否为null或者undefined
        if (key !== null) {
          nextIndex = nextKeyMap.get(key);
        } else {
          //只能遍历判断了
          for (let j = index; j <= nextChildrenIndex; j++) {
            if (isSameVNode(prevChildren[i], nextChildren[j])) {
              nextIndex = j;
              break;
            }
          }
        }
        //说明在新的中没有找到
        if (nextIndex === undefined) {
          // 说明没有这一项，则需要调用删除
          hostRemove(prevChildren[i].el);
        } else {
          // 说明存在，则需要判断是否有更新，若有更新的话则需要渲染新的
          patch(
            prevChildren[i],
            nextChildren[nextIndex],
            container,
            parent,
            null
          );
          nextIndexToOldIndexMap[nextIndex - index] = i;
          nextOperatedCount++;
        }
      }
      const increasingNextIndexMap = getSequence(nextIndexToOldIndexMap);
      // 遍历需要处理变动的节点，判断是否需要移动
      // 这里其实是两个递增序列，进行分类
      const increasingNextIndexMapLength = increasingNextIndexMap.length;
      let increasingIndex = increasingNextIndexMapLength - 1;
      for (let i = totalOperateCount - 1; i >= 0; i--) {
        // 这里需要考虑一点，可能
        if (i !== increasingNextIndexMap[increasingIndex]) {
          // 找到需要移动的元素，如何定位其插入的位置呢？
          const nextIndex = i + index;
          const anchor =
            nextIndex + 1 < nextChildrenLength
              ? nextChildren[nextIndex + 1].el
              : null;
          hostInsert(nextChildren[nextIndex].el, container, anchor);
        } else {
          //正常渲染即可
          increasingIndex--;
        }
      }
    }
  }
  /**
   * 描述：删除元素
   * @param {  }
   * @return
   */
  function unmounteChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
  }
  /**
   * 描述： 处理更新时的props逻辑
   * @param {  }
   * @return
   */
  function updateProps(prevVnode, vnode, el) {
    const prevProps = prevVnode.props || {};
    const newProps = vnode.props || {};
    //遍历新的props,若当前key在老的props中也存在，且值不相同的，进行更新操作
    for (let key in newProps) {
      const prevProp = prevProps[key];
      const newProp = newProps[key];
      if (prevProp !== newProp) {
        patchProps(el, key, prevProp, newProp);
      }
    }
    for (let key in prevProps) {
      if (!(key in newProps)) {
        const prevProp = prevProps[key];
        patchProps(el, key, prevProp, null);
      }
    }
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
    parent: any,
    anchor: any
  ) {
    const el = createElement(vnode.type);
    vnode.el = el;
    // 处理children
    const { children, props, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.CHILDREN_TEXT) {
      // 说明是简单的文本形式
      el.innerText = children;
    } else if (shapeFlag & ShapeFlags.CHILDREN_ARRAY) {
      mountChildren(children, el, parent, anchor);
    }
    // 处理props(props传递是对象，所以需要遍历对象)
    for (let key in props) {
      const val = props[key];
      patchProps(el, key, null, val);
    }
    // 挂载
    hostInsert(el, container, anchor);
  }
  /**
   * 描述：处理虚拟dom存在子元素的情况
   * @param { any[] } children 子元素的虚拟dom集合
   * @param { any } container 子元素的虚拟dom所属父节点元素
   * @return void
   */
  function mountChildren(
    children: any[],
    container: any,
    parent: any,
    anchor: any
  ) {
    children.forEach((ele) => {
      patch(null, ele, container, parent, anchor);
    });
  }
  /**
   * 描述：处理Fragment类型节点渲染
   * @param { any } vnode
   * @param { HTMLElement } container
   * @return
   */
  function processFragment(
    prevVnode: any,
    vnode: any,
    container: HTMLElement,
    parent: any,
    anchor: any
  ) {
    //  调用mountChildren方法
    mountChildren(vnode.children, container, parent, anchor);
  }
  function processText(
    prevVnode: any,
    vnode: any,
    container: HTMLElement,
    anchor: any
  ) {
    const { children } = vnode;
    const textNode = document.createTextNode(children);
    // container.append(textNode);
    container.insertBefore(textNode, anchor || null);
  }
  return {
    createApp: createAppAPI(render),
  };
}
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
