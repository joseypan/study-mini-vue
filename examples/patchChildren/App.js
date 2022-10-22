import { h } from "../../lib/guid-mini-vue.esm.js";
import ArrayToText from "./ArrayToText.js";
import TextToText from "./TextToText.js";
import TextToArray from "./TextToArray.js";
const App = {
  name: "App",
  setup() {
    return {};
  },
  render() {
    return h("div", {}, [
      h("div", {}, "更新children"),
      // h(ArrayToText),
      // h(TextToText),
      h(TextToArray),
    ]);
  },
};
export default App;
