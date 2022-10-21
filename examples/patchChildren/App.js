import { h } from "../../lib/guid-mini-vue.esm.js";
import ChildrenToText from "./ChildrenToText.js";
const App = {
  name: "App",
  setup() {
    return {};
  },
  render() {
    return h("div", {}, [h("div", {}, "更新children"), h(ChildrenToText)]);
  },
};
export default App;
