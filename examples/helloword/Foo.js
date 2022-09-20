import { h } from "../../lib/guid-mini-vue.esm.js";

const Foo = {
  setup(props) {
    console.log("props", props);
    return {};
  },
  render() {
    return h("div", {}, `foo:${this.count}`);
  },
};
export default Foo;
