import { h, ref } from "../../lib/guid-mini-vue.esm.js";

const App = {
  name: "App",
  setup() {
    let count = ref(0);
    const handleClick = () => {
      for (let i = 0; i < 50; i++) {
        count.value++;
      }
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
