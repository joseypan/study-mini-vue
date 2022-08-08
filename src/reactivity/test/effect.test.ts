import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("happy path", () => {
    let reactiveData = reactive({ foo: 10 });
    let num;
    effect(() => {
      num = reactiveData.foo + 2;
    });
    expect(num).toBe(12);
    reactiveData.foo++;
    expect(num).toBe(13);
  });
  it("test runner", () => {
    // 主要是需要验证effect方法会返回一个runner方法，并且调用runner方法会再次执行fn,并且会返回fn中的值
    let foo = 1;
    let runner = effect(() => {
      foo++;
      return "foo_result";
    });
    expect(foo).toBe(2);
    let result = runner();
    expect(foo).toBe(3);
    expect(result).toBe("foo_result");
  });
  it("schedule", () => {
    let foo;
    let run;
    const schedule = jest.fn(() => {
      run = runner;
    });
    let reactiveData = reactive({ num: 2 });
    let runner = effect(
      () => {
        foo = reactiveData.num + 3;
      },
      { schedule }
    );
    expect(schedule).not.toBeCalled();
    expect(foo).toBe(5);
    reactiveData.num++;
    expect(foo).toBe(5);
    expect(schedule).toBeCalledTimes(1);
    run();
    expect(foo).toBe(6);
  });
  it("sotp", () => {
    // 要实现stop功能是我们需要创建一个stop方法，调用stop方法传入runner方法之后，即使再触发响应式对象的变化，也不会重新执行fn,但是当手动调用runner时，可以执行fn
    let reactiveRaw = reactive({ foo: 22 });
    let num;
    let runner = effect(() => {
      num = reactiveRaw.foo;
    });
    reactiveRaw.foo = 5;
    expect(num).toBe(5);
    stop(runner);
    reactiveRaw.foo = 10;
    expect(num).toBe(5);
    // reactiveRaw.foo++;
    // expect(num).toBe(5);
    runner();
    expect(num).toBe(10);
  });
  it("onStop", () => {
    let reactiveRaw = reactive({ foo: 22 });
    let num;
    const onStop = jest.fn();
    let runner = effect(
      () => {
        num = reactiveRaw.foo;
      },
      {
        onStop,
      }
    );
    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
});
