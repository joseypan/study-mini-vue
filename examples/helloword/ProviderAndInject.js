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
    const grade = inject("grade", () => "third");
    return {
      name,
      age,
      gender,
      grade,
    };
  },
  render() {
    return h(
      "div",
      {},
      `CardInfo : ${this.name}(${this.age} years old,gender:${this.gender},grade:${this.grade})`
    );
  },
};
const ProviderMiddleWare = {
  name: "ProviderMiddleWare",
  setup() {
    provider("gender", "female");
    provider("name", "mike");
    const name = inject("name");
    return { name };
  },
  render() {
    return h("div", {}, [
      h("p", {}, `ProviderMiddleWare:${this.name}`),
      h(Consumer),
    ]);
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
const App = {
  name: "App",
  setup() {},
  render() {
    return h("div", {}, [h(Provider)]);
  },
};
export default App;
