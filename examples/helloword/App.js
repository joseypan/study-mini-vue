import {
  createTextVNode,
  h,
  getCurrentInstance,
} from "../../lib/guid-mini-vue.esm.js";
import Foo from "./Foo.js";
const App = {
  name: "App",
  render() {
    window.self = this;
    return h("div", {}, [
      h("p", { class: "red" }, "hello"),
      // h(
      //   "p",
      //   {
      //     class: "blue",
      //     onClick: () => {
      //       console.log("click");
      //     },
      //     onMousedown: () => {
      //       console.log("mousedown");
      //     },
      //   },
      //   this.msg
      // ),
      // [
      //         h("p", {}, "123"),
      //         h("p", {}, "456"),
      //       ]
      h(
        Foo,
        { count: 2, onAdd: this.handleAdd, onFooBar: this.handleFooBar },
        // [h("p", {}, "123"), h("p", {}, "456")]
        // h("p", {}, "123")
        {
          default: ({ age }) => h("p", {}, "default" + age),
          footer: () => [h("p", {}, "footer"), createTextVNode("hello text")],
        }
      ),
    ]);
  },
  setup() {
    const instance = getCurrentInstance();
    console.log("instance", instance);
    const handleAdd = (a, b) => {
      console.log("handleAdd_App", a, b);
    };
    const handleFooBar = () => {
      console.log("handleFooBar");
    };
    return {
      msg: "joseypan",
      handleAdd,
      handleFooBar,
    };
  },
};
export default App;
