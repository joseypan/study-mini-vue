import { h } from "../../lib/guid-mini-vue.esm.js";
const App = {
  render() {
    window.self = this;
    return h(
      "div",
      {
        class: "red",
      },
      [
        h("p", { class: "red" }, "hello"),
        h(
          "p",
          {
            class: "blue",
            onClick: () => {
              console.log("click");
            },
            onMousedown: () => {
              console.log("mousedown");
            },
          },
          this.msg
        ),
      ]
    );
  },
  setup() {
    return {
      msg: "joseypan",
    };
  },
};
export default App;
