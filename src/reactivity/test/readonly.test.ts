import { readonly } from "../reactive";

describe("readonly", () => {
  it("happy path", () => {
    // readonly的实现和reactive一致，但是没有set方法
    const raw = { num: 2 };
    const readonlyData = readonly(raw);
    expect(readonlyData).not.toBe(raw);
    expect(readonlyData.num).toBe(2);
  });
  it("no set", () => {
    const raw = { num: 2 };
    console.warn = jest.fn();
    const readonlyData = readonly(raw);
    readonlyData.num++;
    expect(console.warn).toBeCalled();
  });
});
