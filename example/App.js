import {
  h,
  createTextVNode,
  getCurrentInstance,
  provide,
  inject,
} from "../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";
window.sele = null;
const Provider = {
  name: "Provider",
  setup() {
    provide("foo", "fooval");
    provide("bar", "barval");
  },
  render() {
    return h("div", {}, [h("p", {}, "Provider"), h(ProviderTwo)]);
  },
};
const ProviderTwo = {
  name: "ProviderTwo",
  setup() {
    const foo = inject("foo");
    provide("foo", "fooTwo");
    return { foo };
  },
  render() {
    return h("div", {}, [h("p", {}, "ProviderTwo" + this.foo), h(Consumer)]);
  },
};
const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    const baz = inject("baz", "defaultBaz");
    return { foo, bar, baz };
  },
  render() {
    return h("div", {}, `Consumer - ${this.foo} - ${this.bar} - ${this.baz}`);
  },
};
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
        h(
          Foo,
          {
            count: 1,
            onAdd(a, b) {
              console.log("onAdd ", a, b);
            },
            onAddFoo() {
              console.log("onAddFoo");
            },
          },
          {
            header: ({ age }) => [
              h("p", {}, "slots form foo1" + age),
              createTextVNode("你好"),
            ],
            footer: () => h("p", {}, "slots form foo2"),
          }
        ),
        h(Provider),
      ]
      // [h('div', {class: ['red']}, 'hi-red' ), h('div', {class: ['blue']}, 'hi-blue' )]
    );
  },
  setup() {
    const AppCurrentInstance = getCurrentInstance();
    console.log("AppCurrentInstance: ", AppCurrentInstance);
    return {
      msg: "mini-vue-1",
    };
  },
};
