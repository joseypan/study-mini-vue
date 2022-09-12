import { h } from "../../lib/guid-mini-vue.esm.js";
const App = {
  render() {
    h("div", `hello mini-vue by ${this.msg}`);
  },
  setup() {
    return {
      msg: "joseypan",
    };
  },
};
export default App;
