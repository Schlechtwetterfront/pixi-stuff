import { Graphics, Point, Renderer } from "pixi.js";
import { PLUGIN_NAME } from "./instanced-line-renderer";

export class LineGraphics extends Graphics {
  constructor(
    readonly linePoints: Point[],
    readonly thickness: number,
    readonly alignment: number
  ) {
    super();

    // This is only for debugging. Create a standard Pixi line geometry that should look the same
    // as the instanced one (at scale 1!)
    this.lineStyle({
      width: this.thickness,
      color: 0xffffff,
      alignment: this.alignment,
    });

    const { x, y } = this.linePoints[0];

    this.moveTo(x, y);

    this.linePoints.slice(1).forEach(({ x, y }) => this.lineTo(x, y));
  }

  // By default, pixi would want to batch the geometry of this Graphics and then only send the batch
  // data along to the render plugin. The instanced renderer can't do anything with the batch data,
  // so instead send the InstancedGraphics directly
  protected override _render(renderer: Renderer): void {
    if (this.pluginName !== PLUGIN_NAME) {
      super._render(renderer);

      return;
    }

    const plugin = renderer.plugins[this.pluginName];

    renderer.batch.setObjectRenderer(plugin);
    plugin.render(this);
  }
}
