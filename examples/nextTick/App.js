import {
  getCurrentInstance,
  h,
  nextTick,
  ref,
} from "../../lib/guid-mini-vue.esm.js";

const App = {
  name: "App",
  setup() {
    let count = ref(0);
    const instance = getCurrentInstance();
    const handleClick = () => {
      for (let i = 1; i < 100; i++) {
        console.log("count_value", count.value);
        count.value++;
      }
      debugger;
      console.log("currentInstance", instance); //这里打上断点，去查看元素的el会发现还是0没有发生变动，如果我们在当下获取元素内部的值就会是错误的
      nextTick(() => {
        debugger;
        console.log("currentInstance", instance); //这里打上断点
      });
    };
    return {
      count,
      handleClick,
    };
  },
  render() {
    return h("div", {}, [
      h("button", { onClick: this.handleClick }, "click"),
      h("p", {}, `count:${this.count}`),
    ]);
  },
};
export default App;
