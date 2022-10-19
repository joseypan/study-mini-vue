import { h, ref } from "../../lib/guid-mini-vue.esm.js";
const App = {
  name: "App",
  setup() {
    let appCount = ref(0);
    const clickHandler = () => {
      appCount.value++;
    };
    let props = ref({
      foo: "foo",
      bar: "bar",
    });
    const modifyProps = () => {
      props.value.foo = "foo-new";
    };
    const changePropsToUndefined = () => {
      props.value.foo = undefined;
    };
    const deleteProps = () => {
      props.value = {
        foo: "foo-bar",
      };
    };

    return {
      appCount,
      clickHandler,
      modifyProps,
      props,
      changePropsToUndefined,
      deleteProps,
    };
  },
  render() {
    return h("div", { ...this.props }, [
      h("p", {}, `count:${this.appCount}`),
      h("button", { onClick: this.clickHandler }, "click"),
      h("button", { onClick: this.modifyProps }, "修改props的值"),
      h(
        "button",
        { onClick: this.changePropsToUndefined },
        "将foo的值修改为undefined"
      ),
      h("button", { onClick: this.deleteProps }, "删除props的值"),
    ]);
  },
};
export default App;
