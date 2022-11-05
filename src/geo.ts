import { Buffer, Geometry, TYPES } from "pixi.js";

const STRIDE =
  2 * Float32Array.BYTES_PER_ELEMENT + // start
  2 * Float32Array.BYTES_PER_ELEMENT + // end
  1 * Float32Array.BYTES_PER_ELEMENT + // thickness
  1 * Float32Array.BYTES_PER_ELEMENT + // alignment
  4 * Float32Array.BYTES_PER_ELEMENT; // color

export const INSTANCE_SIZE = STRIDE;

export function buildLineSegmentGeo(buffer: Buffer) {
  // Represents one line segment
  return (
    new Geometry()
      // Geometry is always the same. Values are not actual vertex positions, but chosen as factors
      // for vectors/distances calculated in the vertex shader
      // This is the only static attribute
      .addAttribute(
        "aVertexPosition",
        [0, 0.5, 1, 0.5, 0, -0.5, 1, -0.5],
        2,
        false,
        TYPES.FLOAT
      )
      // From here on all attributes are per-instance attributes, interleaved into one buffer
      // Start point of line segment
      .addAttribute("aStart", buffer, 2, false, TYPES.FLOAT, STRIDE, 0, true)
      // End of line segment
      .addAttribute(
        "aEnd",
        buffer,
        2,
        false,
        TYPES.FLOAT,
        STRIDE,
        2 * Float32Array.BYTES_PER_ELEMENT,
        true
      )
      // Thickness in world units (~= pixels in pixi)
      .addAttribute(
        "aThickness",
        buffer,
        1,
        false,
        TYPES.FLOAT,
        STRIDE,
        4 * Float32Array.BYTES_PER_ELEMENT,
        true
      )
      // Inside/center/outside as value from 0-1
      .addAttribute(
        "aAlignment",
        buffer,
        1,
        false,
        TYPES.FLOAT,
        STRIDE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        true
      )
      // RGBA colors
      .addAttribute(
        "aColor",
        buffer,
        4,
        true,
        TYPES.FLOAT,
        STRIDE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        true
      )
  );
}
