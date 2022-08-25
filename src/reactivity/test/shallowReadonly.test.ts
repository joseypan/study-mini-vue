import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  it("happy path", () => {
    const raw = {
      name: "josey",
      data: {
        num: 1,
      },
    };
    const reactiveObj = shallowReadonly(raw);
    expect(isReadonly(reactiveObj)).toBe(true);
    expect(isReadonly(reactiveObj.data)).toBe(false);
  });
});
