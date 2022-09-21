import { h } from "../../lib/guid-mini-vue.esm.js";
import Foo from "./Foo.js";
const App = {
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
      h(
        Foo,
        { count: 2, onAdd: this.handleAdd, onFooBar: this.handleFooBar },
        []
      ),
    ]);
  },
  setup() {
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
