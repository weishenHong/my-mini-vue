import { h, ref } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  render() {
    return h(
      "div",
      {
        foo: this.foo,
        bar: this.bar,
        id: "root",
        class: "red",
      },
      [
        h("div", {}, "hi," + this.count),
        h("button", { onClick: this.onClick }, "click"),
        h(
          "button",
          { onClick: this.onClickToChangeProps },
          "clickFn to change props"
        ),
        h(
          "button",
          { onClick: this.onClickToChangePropsNull },
          "clickFn to change props - null"
        ),
      ]
    );
  },
  setup() {
    const foo = ref("foo");
    const bar = ref("bar");
    const onClick = () => {
      count.value++;
    };
    const onClickToChangeProps = () => {
      foo.value = "new-foo";
    };
    const onClickToChangePropsNull = () => {
      foo.value = null;
    };
    const count = ref(0);
    return {
      foo,
      onClickToChangeProps,
      onClickToChangePropsNull,
      bar,
      count,
      onClick,
    };
  },
};
