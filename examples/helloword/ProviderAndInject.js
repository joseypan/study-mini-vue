import { h, provider, inject } from "../../lib/guid-mini-vue.esm.js";

const Consumer = {
  name: "Consumer",
  setup() {
    const name = inject("name");
    const age = inject("age");
    return {
      name,
      age,
    };
  },
  render() {
    return h("div", {}, `CardInfo : ${this.name}(${this.age} years old)`);
  },
};
const Provider = {
  name: "Provider",
  setup() {
    provider("name", "josey");
    provider("age", 25);
  },
  render() {
    return h("div", {}, [h(Consumer)]);
  },
};
export default Provider;
