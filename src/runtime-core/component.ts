
export function createComponentInstance(vnode: any) {
    const component = {
        vnode,
        type: vnode.type
    }
    return component
}

export function setupComponent(instance: { vnode: any; type: any }) {
    // initProps()   
    // initSlots()

    setupStatefuComponent(instance)
};
function setupStatefuComponent(instance: any) {
    const component = instance.type
    const {setup} = component
    if(setup) {
        const setupResult = setup()
        handleSetupResult(instance , setupResult)
    }
}
function handleSetupResult(instance: { setupState: any } ,setupResult: any) {
    if(typeof setupResult === 'object'){
       instance.setupState  = setupResult 
    }

    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const component = instance.type 
    if(component.render){
        instance.render = component.render 
    }
}