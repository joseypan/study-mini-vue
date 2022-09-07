const App = {
  render(h) {
    h("div", `hello mini-vue by ${this.msg}`);
  },
  setup() {
    return {
      msg: "joseypan",
    };
  },
};
