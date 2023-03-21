import {h} from '../lib/guide-mini-vue.esm.js';
export const App = {
    render() {
        return h('div', {
            id: 'root', 
            class: ['red']
        },
        // 'hi,' + this.msg
        [h('div', {class: ['red']}, 'hi-red' ), h('div', {class: ['blue']}, 'hi-blue' )]
        )
    },
    setup() {
        return {
            msg: 'mini-vue'
        }
    }
}