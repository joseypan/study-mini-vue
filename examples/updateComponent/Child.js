import { h } from "../../lib/guid-mini-vue.esm.js";

const Child = {
  name: "Child",
  setup() {
    return {};
  },
  render() {
    return h("p", {}, `This is msg:${this.$props.msg}`);
  },
};
export default Child;
