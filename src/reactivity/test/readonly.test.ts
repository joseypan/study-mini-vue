import { isProxy, isReadonly, readonly } from "../reactive";

describe("readonly", () => {
  it("happy path", () => {
    // readonly的实现和reactive一致，但是没有set方法
    const raw = { num: 2 };
    const readonlyData = readonly(raw);
    expect(readonlyData).not.toBe(raw);
    expect(readonlyData.num).toBe(2);
    expect(isReadonly(readonlyData)).toBe(true);
    expect(isReadonly(raw)).toBe(false);
    expect(isProxy(readonlyData)).toBe(true);
  });
  it("no set", () => {
    const raw = { num: 2 };
    console.warn = jest.fn();
    const readonlyData = readonly(raw);
    readonlyData.num++;
    expect(console.warn).toBeCalled();
  });
  it("nest object", () => {
    const foo = {
      bar: {
        name: "josey",
      },
      age: 25,
      data: [{ gender: "female" }],
    };
    const readonlyFoo = readonly(foo);
    expect(isReadonly(readonlyFoo.bar)).toBe(true);
    expect(isReadonly(readonlyFoo.data)).toBe(true);
    expect(isReadonly(readonlyFoo.data[0])).toBe(true);
  });
});
