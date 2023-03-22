import { h } from "../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";
window.sele = null;
export const App = {
  render() {
    window.sele = this;
    return h(
      "div",
      {
        id: "root",
        class: ["red"],
        onClick() {
          alert("click");
        },
      },
      [h("div", {}, "hi," + this.msg), h(Foo, { count: 1 })]
      // [h('div', {class: ['red']}, 'hi-red' ), h('div', {class: ['blue']}, 'hi-blue' )]
    );
  },
  setup() {
    return {
      msg: "mini-vue-1",
    };
  },
};
