import { createVNode } from "./vnode"
import { render } from "./renderer"

export function createApp(rootComponent: any) {
    return {
        mount(rootContainer: any) {
            const vnode = createVNode(rootComponent)
            render(vnode, rootContainer)
        }
    }
}