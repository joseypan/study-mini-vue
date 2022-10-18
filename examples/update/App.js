import { h, ref } from "../../lib/guid-mini-vue.esm.js";
const App = {
  name: "App",
  setup() {
    let count = ref(0);
    const clickHandler = () => {
      console.log("clickHandler");
      count.value = count.value + 1;
    };
    return {
      count,
      clickHandler,
    };
  },
  render() {
    return h("div", {}, [
      h("p", {}, `count:${this.count}`),
      h("button", { onClick: this.clickHandler }, "click"),
    ]);
  },
};
export default App;
