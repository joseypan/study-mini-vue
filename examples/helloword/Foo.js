import {
  h,
  renderSlots,
  getCurrentInstance,
} from "../../lib/guid-mini-vue.esm.js";

const Foo = {
  name: "Foo",
  setup(props, { emit }) {
    const instance = getCurrentInstance();
    console.log("instance", instance);
    console.log("props", props);
    const handleClick = () => {
      console.log("handle_click");
      // 这里我们希望通过emit，能够使得父组件的add事件触发，继而调用handleAdd
      // 首先emit在vue中是作为第二个参数对象中的属性而存在的，所以我们需要考虑一下如何传参
      emit("add", 1, 2);
      emit("foo-bar");
    };
    return { handleClick };
  },
  render() {
    console.log("$slots", this.$slots);
    const age = 18;
    return h("div", {}, [
      h("div", {}, `foo:${this.count}`),
      h("button", { onClick: this.handleClick }, "click button"),
      renderSlots(this.$slots, "footer"),
      renderSlots(this.$slots, "default", { age }),
    ]);
  },
};
export default Foo;
