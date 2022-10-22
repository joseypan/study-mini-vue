import { h, ref } from "../../lib/guid-mini-vue.esm.js";
const nextChildren = [h("p", {}, "A"), h("p", {}, "B")];
const prevChildren = "children";
const TextToArray = {
  name: "TextToArray",
  setup() {
    let isChange = ref(false);
    window.isChange = isChange;
    return {
      isChange,
    };
  },
  render() {
    const self = this;
    return self.isChange === true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren);
  },
};
export default TextToArray;
