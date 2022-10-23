import { h, ref } from "../../lib/guid-mini-vue.esm.js";
// prev 是 A B next是 A B C
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
// ];
// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// prev 是 A B next是 C A B
// const nextChildren = [
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
// ];
// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// prev 是 A B C next是 A B
// const nextChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
// ];
// prev 是 C A B next是 A B
// const nextChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const prevChildren = [
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
// ];
// prev是 A B C D E F next是 A B G C E F
const nextChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "G" }, "G"),
  h("p", { key: "C", id: "next-node" }, "C"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "F" }, "F"),
];
const prevChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C", id: "prev-node" }, "C"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "F" }, "F"),
];
const ArrayToArray = {
  name: "ArrayToArray",
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
export default ArrayToArray;
