import { h, ref } from "../../lib/guid-mini-vue.esm.js";
import Child from "./Child.js";
const App = {
  name: "App",
  setup() {
    let msg = ref("123");
    window.msg = msg;
    const changeMsg = () => {
      msg.value = "456";
    };
    let count = ref(1);
    window.count = count;
    const changeCount = () => {
      count.value = count.value + 1;
    };
    return {
      msg,
      changeMsg,
      count,
      changeCount,
    };
  },
  render() {
    return h("div", {}, [
      h("p", {}, "hello component"),
      h("button", { onClick: this.changeMsg }, "clcik change msg"),
      h(Child, { msg: this.msg }),
      h("button", { onClick: this.changeCount }, "clcik change count"),
      h("p", {}, `count:${this.count}`),
    ]);
  },
};
export default App;
