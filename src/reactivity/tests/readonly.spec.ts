import { isReadonly, readonly } from "..";

describe("readonly", () => {
    it('happy path', () => {
        const original = { foo: 1 };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    // get
    expect(wrapped.foo).toBe(1);

    expect(isReadonly(wrapped)).toBe(true)
    })

    it('warn then call set', () => {
        console.warn = jest.fn()
        const user = readonly({age: 10})
        user.age = 11

        
        expect(console.warn).toBeCalled()
    })

})