import reactive from "../reactive";

// 使用import语法报错，那是因为我们执行的是node环境，默认是commonjs语法，但是我们想要兼容esm模块，所以哟啊借助babel
describe("reactive", () => {
  it("happy path", () => {
    //需要定义一个对象，{foo:1}
    let raw = { foo: 1 };
    const observed = reactive(raw);
    expect(observed).not.toBe(raw);
    expect(observed.foo).toBe(1);
  });
});
