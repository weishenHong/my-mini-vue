import { h } from "../lib/guide-mini-vue.esm.js";
window.sele = null;
export const App = {
  render() {
    window.sele = this;
    return h(
      "div",
      {
        id: "root",
        class: ["red"],
      },
      "hi," + this.msg
      // [h('div', {class: ['red']}, 'hi-red' ), h('div', {class: ['blue']}, 'hi-blue' )]
    );
  },
  setup() {
    return {
      msg: "mini-vue-1",
    };
  },
};
