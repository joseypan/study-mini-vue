import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
  it("happy path", () => {
    const data = reactive({
      num: 1,
    });
    const cValue = computed(() => {
      return data.num;
    });
    expect(cValue.value).toBe(1);
  });
  it("lazy", () => {
    const data = reactive({
      num: 1,
    });
    const getter = jest.fn(() => {
      return data.num;
    });
    const cValue = computed(getter);
    expect(getter).not.toHaveBeenCalled();
    // 调用cValue.value的时候会触发trigger方法，但是并没有收集操作，所以会有错误
    expect(cValue.value).toBe(1);
    expect(getter).toBeCalledTimes(1);
    cValue.value;
    expect(getter).toBeCalledTimes(1);
    data.num = 2;
    expect(getter).toBeCalledTimes(1);
    expect(cValue.value).toBe(2);
    expect(getter).toBeCalledTimes(2);
  });
});
