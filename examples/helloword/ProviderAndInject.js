import {
  h,
  provider,
  inject,
  getCurrentInstance,
} from "../../lib/guid-mini-vue.esm.js";

const Consumer = {
  name: "Consumer",
  setup() {
    const instance = getCurrentInstance();
    const name = inject("name");
    const age = inject("age");
    const gender = inject("gender");
    return {
      name,
      age,
      gender,
    };
  },
  render() {
    return h(
      "div",
      {},
      `CardInfo : ${this.name}(${this.age} years old,gender:${this.gender})`
    );
  },
};
const ProviderMiddleWare = {
  name: "ProviderMiddleWare",
  setup() {
    provider("gender", "female");
    return {};
  },
  render() {
    return h(Consumer);
  },
};
const Provider = {
  name: "Provider",
  setup() {
    provider("name", "josey");
    provider("age", 25);
  },
  render() {
    return h("div", {}, [h(ProviderMiddleWare)]);
  },
};
export default Provider;
