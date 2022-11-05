import { Application, Point } from "pixi.js";
import { PLUGIN_NAME } from "./instanced-line-renderer";
import { LineGraphics } from "./line-graphics";

export function sin(
  app: Application,
  xOffset: number,
  yOffset: number,
  size: number,
  alignment: number,
  color: number,
  thickness: number
) {
  const steps = 200;
  const xStep = app.screen.width / steps;
  const yStart = yOffset;

  const points = [] as Point[];

  for (let i = 0; i < steps; i++) {
    const r = (i * Math.PI) / 16;

    const x = i * xStep + xOffset;
    const y = Math.sin(r) * size + yStart;

    points.push(new Point(x, y));
  }

  const lg = new LineGraphics(points, thickness, alignment);
  lg.tint = color;
  lg.pluginName = PLUGIN_NAME;

  app.stage.addChild(lg);
}
