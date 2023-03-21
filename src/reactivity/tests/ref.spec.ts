import { reactive } from "../index";
import { effect } from "../effect";
import { isRef, proxyRefs, ref, unRef } from "../ref";

describe("ref", () => {
  it("happy path", () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  });
  it("should be reactive", () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = a.value;
    });
    expect(calls).toBe(1);
    expect(dummy).toBe(1);

    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);

    // same value should`n trigger
    a.value = 2;
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

  // isRef unRef
  it("isRef", () => {
    const a = ref(1);
    const user = reactive({ foo: 1 });
    expect(isRef(a)).toBe(true);
    expect(isRef(user)).toBe(false);
  });

  it("unRef", () => {
    const a = ref(1);
    expect(unRef(a)).toBe(1);
    expect(unRef(1)).toBe(1);
  });

  it("proxyRef", () => {
    const user = {
      age: ref(1),
      name: "name",
    };
    const proxy = proxyRefs(user);
    expect(user.age.value).toBe(1);
    expect(proxy.age).toBe(1);
    expect(proxy.name).toBe("name");

    proxy.age = 20;
    expect(proxy.age).toBe(20);
    expect(user.age.value).toBe(20);
  });
});
