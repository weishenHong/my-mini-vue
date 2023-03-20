import { reactiveEffect } from "./effect"

class ComputedRefImpl {
    private _getter: any
    private dirty: boolean = true // 实现缓存
    private _value: any
    private _effect: reactiveEffect
    
    constructor(getter) {
        this._getter = getter
        this._effect = new reactiveEffect(getter, () => {
            this.dirty = true
        })
    }
    get value () {
        if(this.dirty){
            this.dirty = false
            this._value = this._effect.run()
        }
        return this._value
    }
}
export function computed(getter) {
    return new ComputedRefImpl(getter)
};
