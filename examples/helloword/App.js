import { h } from "../../lib/guid-mini-vue.esm.js";
const App = {
  render() {
    return h(
      "div",
      {
        class: "red",
      },
      [h("p", { class: "red" }, "hello"), h("p", { class: "blue" }, "mini-vue")]
    );
  },
  setup() {
    return {
      msg: "joseypan",
    };
  },
};
export default App;
