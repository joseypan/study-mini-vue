import { h, ref } from "../../lib/guid-mini-vue.esm.js";
const nextChildren = [h("p", {}, "A"), h("p", {}, "B")];
const prevChildren = "children";
const ChildrenToText = {
  name: "TextToText",
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
export default ChildrenToText;
