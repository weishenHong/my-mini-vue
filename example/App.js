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
        onClick() {},
      },
      [
        h("div", {}, "hi," + this.msg),
        h(Foo, {
          count: 1,
          onAdd(a, b) {
            console.log("onAdd ", a, b);
          },
          onAddFoo() {
            console.log("onAddFoo");
          },
        }),
      ]
      // [h('div', {class: ['red']}, 'hi-red' ), h('div', {class: ['blue']}, 'hi-blue' )]
    );
  },
  setup() {
    return {
      msg: "mini-vue-1",
    };
  },
};
