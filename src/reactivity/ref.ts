import { reactive } from "./index";
import { hasChanged, isObject } from "../shared/index";
import { isTracking, trackEffect, triggerEffects } from "./effect";

class RefImpl {
  private _value: any;
  public dep = new Set();
  private _rawValue: any;
  public _v_isRef = true;
  constructor(value: any) {
    this._rawValue = value;
    this._value = convert(value);
  }
  get value() {
    if (isTracking()) {
      trackEffect(this.dep);
    }
    return this._value;
  }
  set value(newValue) {
    if (!hasChanged(this._rawValue, newValue)) return;
    this._rawValue = newValue;
    this._value = convert(newValue);
    triggerEffects(this.dep);
  }
}
export function ref(value: any) {
  return new RefImpl(value);
}

function convert(value: any) {
  return isObject(value) ? reactive(value) : value;
}

export function isRef(ref: any) {
  return !!ref._v_isRef;
}
export function unRef(ref: any) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRefs: any) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        target[key].value = value;
        return true;
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}
