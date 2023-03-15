import { track, trigger } from "./effect"

export function reactive(original: any){
    // proxy 对象
    return  new Proxy(original,  {
        get(original, key, receiver){
            const res = Reflect.get(original, key, receiver)
            // TODO 依赖收集
            track(original , key)
            return  res

        },
        set(target,key ,newValue,receiver){
            const res = Reflect.set(target, key, newValue, receiver)
            // TODO 触发依赖

            trigger(target, key)
            return res 
        }
    })
}
