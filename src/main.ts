import { Application, extensions, ExtensionType } from "pixi.js";
import { sin } from "./generators";
import { InstancedLineRenderer, PLUGIN_NAME } from "./instanced-line-renderer";

extensions.add({
  name: PLUGIN_NAME,
  ref: InstancedLineRenderer,
  type: ExtensionType.RendererPlugin,
});

const app = new Application({
  background: 0xeeeeee,
  width: 1600,
  height: 1000,
  autoDensity: true,
  antialias: true,
});

const appEl = document.querySelector("#app");

appEl?.appendChild(app.view as HTMLCanvasElement);

document.addEventListener("keydown", (e: KeyboardEvent) => {
  switch (e.key) {
    case "1":
      app.stage.scale.set(0.05);
      break;

    case "2":
      app.stage.scale.set(0.1);
      break;

    case "3":
      app.stage.scale.set(0.25);
      break;

    case "4":
      app.stage.scale.set(0.5);
      break;

    case "5":
      app.stage.scale.set(1);
      break;

    case "6":
      app.stage.scale.set(2);
      break;

    case "7":
      app.stage.scale.set(5);
      break;

    case "8":
      app.stage.scale.set(10);
      break;

    case "9":
      app.stage.scale.set(20);
      break;
  }
});

let yStep = 80;

for (const [i, _] of new Array(Math.floor(app.screen.height / yStep))
  .fill(0)
  .entries()) {
  sin(app, 0, i * yStep, 100, 1, 0xffcc00, 4);
  sin(app, 0, i * yStep, 100, 0, 0x007aff, 4);
}

yStep = 160;

for (const [i, _] of new Array(Math.floor(app.screen.height / yStep))
  .fill(0)
  .entries()) {
  sin(app, 0, i * yStep, 100, 0.5, 0xff2d55, 8);
}
