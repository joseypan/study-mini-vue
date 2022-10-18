import { h, ref } from "../../lib/guid-mini-vue.esm.js";
const App = {
  name: "App",
  setup() {
    let appCount = ref(0);
    const clickHandler = () => {
      appCount.value++;
    };
    return {
      appCount,
      clickHandler,
    };
  },
  render() {
    return h("div", {}, [
      h("p", {}, `count:${this.appCount}`),
      h("button", { onClick: this.clickHandler }, "click"),
    ]);
  },
};
export default App;
