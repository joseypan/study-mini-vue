import { h, ref } from "../../lib/guid-mini-vue.esm.js";
const nextChildren = h("div", {}, "newChildren");
const prevChildren = h("div", {}, [h("p", {}, "A"), h("p", {}, "B")]);
const ChildrenToText = {
  name: "ChildrenToText",
  setup() {
    let isChange = ref(false);
    window.isChange = isChange;
    return {
      isChange,
    };
  },
  render() {
    window.self = this;
    console.log("render-render");
    return self.isChange.value === true ? nextChildren : prevChildren;
  },
};
export default ChildrenToText;
