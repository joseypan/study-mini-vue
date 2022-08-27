import { effect } from "../effect";
import { reactive } from "../reactive";
import { isRef, proxyRefs, ref, unRef } from "../ref";

describe("ref", () => {
  it("happy path", () => {
    const count = ref(1);
    expect(count.value).toBe(1);
  });
  it("should be reactive", () => {
    const count = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = count.value;
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    count.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    count.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });
  it("should make nested properties reactive", () => {
    const a = ref({
      count: 1,
    });
    let dummy;
    effect(() => {
      dummy = a.value.count;
    });
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });
  it("isRef", () => {
    const a = ref(1);
    const data = reactive({
      count: 2,
    });
    expect(isRef(a)).toBe(true);
    expect(isRef(1)).toBe(false);
    expect(isRef(data)).toBe(false);
  });
  it("unRef", () => {
    const a = ref(1);
    expect(unRef(a)).toBe(1);
    expect(unRef(1)).toBe(1);
  });
  it("proxyRefs", () => {
    const data = {
      count: ref(10),
      name: "josey",
    };
    const proxyUser = proxyRefs(data);
    expect(data.count.value).toBe(10);
    expect(proxyUser.count).toBe(10);
    expect(proxyUser.name).toBe("josey");
    proxyUser.count = 20;
    expect(data.count.value).toBe(20);
    expect(proxyUser.count).toBe(20);
    proxyUser.count = ref(30);
    expect(data.count.value).toBe(30);
    expect(proxyUser.count).toBe(30);
  });
});
