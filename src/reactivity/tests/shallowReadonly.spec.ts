import { isReadonly, shallowReadonly } from "../index";

describe("shallowReadonly", () => {
    it('happy path', () => {
    const original = { foo: 1, bar: {a : 1} };
    const wrapped = shallowReadonly(original);

    expect(isReadonly(wrapped)).toBe(true)
    expect(isReadonly(wrapped.bar)).toBe(false)
    })

    it('warn then call set', () => {
        console.warn = jest.fn()
        const user = shallowReadonly({age: 10})
        user.age = 11

        
        expect(console.warn).toBeCalled()
    })
})