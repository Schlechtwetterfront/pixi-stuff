import { Graphics, Point, Renderer } from "pixi.js";
import { PLUGIN_NAME } from "./instanced-line-renderer";

interface LineSegment {
  before: Point;
  start: Point;
  end: Point;
  after: Point;
}

export class LineGraphics extends Graphics {
  readonly lineSegments: LineSegment[] = [];

  constructor(
    linePoints: Point[],
    readonly thickness: number,
    readonly alignment: number
  ) {
    super();

    for (let i = 0; i < linePoints.length - 1; i++) {
      let before = linePoints[i - 1];
      const start = linePoints[i];
      const end = linePoints[i + 1];
      let after = linePoints[i + 2];

      // Always need 4 points for normal/miter calculation. If we don't have 4, add some fakes at
      // start/end by just extending the line segment so shader can always deal with 4
      if (!before || !after) {
        const diffX = end.x - start.x;
        const diffY = end.y - start.y;

        const length = Math.sqrt(diffX ** 2 + diffY ** 2);

        const tangentX = diffX / length;
        const tangentY = diffY / length;

        if (!before) {
          before = new Point(start.x - tangentX, start.y - tangentY);
        }

        if (!after) {
          after = new Point(end.x + tangentX, end.y + tangentY);
        }
      }

      this.lineSegments.push({ before, start, end, after });
    }

    // This is only for debugging. Create a standard Pixi line geometry that should look the same
    // as the instanced one (at scale 1!)
    this.lineStyle({
      width: this.thickness,
      color: 0xffffff,
      alignment: this.alignment,
    });

    const { x, y } = linePoints[0];

    this.moveTo(x, y);

    linePoints.slice(1).forEach(({ x, y }) => this.lineTo(x, y));
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
