import { createRenderer } from "../../lib/guide-mini-vue.esm.js";
import { App } from "./App.js";
// const rootContainer = document.querySelector("#app");
console.log(PIXI);
const game = new PIXI.Application({
  width: 500,
  height: 500,
});
document.body.append(game.view);
const renderer = createRenderer({
  createElement(type) {
    if (type === "rect") {
      const rect = new PIXI.Graphics();
      rect.beginFill("ff0000");
      rect.drawRect(0, 0, 100, 100);
      rect.endFill();
      return rect;
    }
  },
  patchProps(el, key, value) {
    el[key] = value;
  },
  insert(el, parent) {
    parent.addChild(el);
  },
});
console.log(game);
renderer.createApp(App).mount(game.stage);
// createApp(App).mount(rootContainer);
