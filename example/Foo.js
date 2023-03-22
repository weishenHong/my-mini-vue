import { h, renderSlots } from "../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props, { emit }) {
    const emitAdd = () => {
      emit("add", "a", "b");
      emit("add-foo", "a", "b");
    };
    return { emitAdd };
  },
  render() {
    const btn = h(
      "button",
      {
        onClick: this.emitAdd,
      },
      "emitAdd"
    );
    const foo = h("p", {}, `foo: ${this.count}`);

    const age = 19;
    return h("div", {}, [
      renderSlots(this.$slots, "header", {
        age,
      }),
      foo,
      btn,
      renderSlots(this.$slots, "footer"),
    ]);
  },
};
