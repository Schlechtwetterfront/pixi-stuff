import {
  Buffer,
  DRAW_MODES,
  Geometry,
  ObjectRenderer,
  Point,
  Program,
  Renderer,
  Shader,
  State,
  utils,
  ViewableBuffer,
} from "pixi.js";
import { buildLineSegmentGeo, INSTANCE_SIZE } from "./geo";
import { LineGraphics } from "./line-graphics";
import FRAGMENT_SOURCE from "./line.frag?raw";
import VERTEX_SOURCE from "./line.vert?raw";

const TEMP_POINT = new Point();

export const PLUGIN_NAME = "instancedLineRenderer";

// Pixi WebGL renderer plugin
export class InstancedLineRenderer extends ObjectRenderer {
  private readonly _geo: Geometry;
  private readonly _shader: Shader;
  private readonly _state = State.for2d();

  // Cache for geometry attribute data buffers. Depending on how many instances (line segments) are
  // visible during one render, different sized buffers are necessary
  private readonly _bufferCache: ViewableBuffer[] = [];

  // The actual buffer used by the geometry
  private readonly _instanceBuffer = new Buffer();

  // Keep objects here until it is time to flush and actually render
  private _objects: LineGraphics[] = [];
  private _objectCount = 0;
  private _lineSegmentCount = 0;

  constructor(renderer: Renderer) {
    super(renderer);

    this._geo = buildLineSegmentGeo(this._instanceBuffer);

    this._shader = new Shader(new Program(VERTEX_SOURCE, FRAGMENT_SOURCE));
  }

  // Start is called when this render plugin becomes active (even for just one DisplayObject)
  override start(): void {
    super.start();

    this._objects.length = 0;
    this._objectCount = 0;
    this._lineSegmentCount = 0;
  }

  // Called for every DisplayObject that has pluginName of this render plugin. Keep track of these
  // objects until it's time to flush.
  // Assume only LineGraphics should have pluginName set to this renderer
  override render(object: LineGraphics): void {
    this._objects[this._objectCount] = object;
    this._objectCount++;
    // One line graphics could have multiple line segments (e.g. a curve)
    this._lineSegmentCount += object.linePoints.length - 1;
  }

  // Flush is called when rendering is done/a different render plugin becomes active. Render all
  // objects stored up to this point
  override flush(): void {
    if (this._objectCount === 0) {
      return;
    }

    const totalLineSegmentsSize = INSTANCE_SIZE * this._lineSegmentCount;

    const buffer = this._getOrCreateBuffer(totalLineSegmentsSize);
    const view = buffer.float32View;

    const objectCount = this._objectCount;
    const objects = this._objects;

    let segmentCount = 0;

    for (let i = 0; i < objectCount; i++) {
      const object = objects[i];

      const wt = object.worldTransform;

      const linePoints = object.linePoints;

      for (let j = 0; j < linePoints.length - 1; j++) {
        // Start and end of line segment, in world space
        const { x: x0, y: y0 } = wt.apply(linePoints[j], TEMP_POINT);
        const { x: x1, y: y1 } = wt.apply(linePoints[j + 1], TEMP_POINT);

        // Index of this instance/segment in the interleaved buffer
        const viewIndex =
          (segmentCount * INSTANCE_SIZE) / Float32Array.BYTES_PER_ELEMENT;

        // Fill interleaved buffer with geometry attribute data...

        // aStart
        view[viewIndex] = x0;
        view[viewIndex + 1] = y0;

        // aEnd
        view[viewIndex + 2] = x1;
        view[viewIndex + 3] = y1;

        // aThickness
        view[viewIndex + 4] = object.thickness;

        // aAlignment
        view[viewIndex + 5] = object.alignment;

        // aColor
        const [r, g, b] = utils.hex2rgb(object.tint);

        view[viewIndex + 6] = r;
        view[viewIndex + 7] = g;
        view[viewIndex + 8] = b;
        view[viewIndex + 9] = object.alpha;

        segmentCount++;
      }
    }

    // Apply data to actual GL buffer
    this._instanceBuffer.update(buffer.rawBinaryData);

    const renderer = this.renderer;

    renderer.shader.bind(this._shader);
    renderer.geometry.bind(this._geo);
    renderer.state.set(this._state);

    renderer.geometry.draw(
      DRAW_MODES.TRIANGLE_STRIP,
      undefined,
      undefined,
      segmentCount
    );

    this._objects.length = 0;
    this._objectCount = 0;
    this._lineSegmentCount = 0;
  }

  // Gets a buffer from the cache
  private _getOrCreateBuffer(size: number) {
    // Buffer sizes are always power of two
    const nextPowerOf2 = utils.nextPow2(Math.ceil(size));
    const sizeIndex = utils.log2(nextPowerOf2);

    if (this._bufferCache.length <= sizeIndex) {
      this._bufferCache.length = sizeIndex + 1;
    }

    let buffer = this._bufferCache[sizeIndex];

    if (!buffer) {
      buffer = this._bufferCache[sizeIndex] = new ViewableBuffer(nextPowerOf2);
    }

    return buffer;
  }
}
