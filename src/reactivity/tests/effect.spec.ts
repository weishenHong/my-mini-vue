import { reactive } from "../index";
import { effect, stop } from "../effect";

describe("effect", () => {
  it("reactive effect", () => {
    const user = reactive({
      age: 1,
    });

    let ageNew;
    effect(() => {
      ageNew = user.age + 1;
    });
    expect(ageNew).toBe(2);

    // update
    ageNew = 0;
    user.age++;
    expect(ageNew).toBe(3);
  });
  it("runner", () => {
    let foo = 10;

    const runner = effect(() => {
      foo++;
      return "foo";
    });

    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe("foo");
  });

  it("scheduler", () => {
    let dummy, run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );

    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);

    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);

    expect(dummy).toBe(1);

    run();
    expect(dummy).toBe(2);
  });
  it("stop", () => {
    let dummy;
    let obj = reactive({ foo: 1 });

    const runner = effect(() => {
      dummy = obj.foo;
      return "foo";
    });

    expect(dummy).toBe(1);

    stop(runner);
    obj.foo++;
    expect(dummy).toBe(1);

    runner();
    expect(dummy).toBe(2);
  });

  it("onStop", () => {
    let dummy;
    let obj = reactive({ foo: 1 });
    let onStop = jest.fn();
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );

    stop(runner);
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
