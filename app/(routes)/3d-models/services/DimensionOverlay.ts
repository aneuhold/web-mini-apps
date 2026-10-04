import {
  Box3,
  BoxGeometry,
  BufferGeometry,
  EdgesGeometry,
  Group,
  Line,
  LineBasicMaterial,
  LineSegments,
  Object3D,
  Scene,
  Vector3
} from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const LINE_COLOR = '#e8590c';

/**
 * Draws a bounding box outline and labeled width, depth, and height
 * measurements for one object in a Z-up scene.
 *
 * Lines skip the depth test so measurements stay visible through other
 * objects. Labels are HTML elements, so they need a CSS2DRenderer rendering
 * the same scene.
 */
export default class DimensionOverlay {
  private readonly group = new Group();
  private readonly geometries: BufferGeometry[] = [];
  private readonly material = new LineBasicMaterial({ color: LINE_COLOR, depthTest: false });

  constructor(
    scene: Scene,
    private readonly labelClassName: string
  ) {
    scene.add(this.group);
  }

  /**
   * Shows the measurements of `bounds`, drawn along the edges at the corner
   * closest to `viewPoint` so they face the viewer.
   */
  show(bounds: Box3, viewPoint: Vector3) {
    this.clear();
    const { min, max } = bounds;
    const center = bounds.getCenter(new Vector3());
    const [nearX, farX] = viewPoint.x > center.x ? [max.x, min.x] : [min.x, max.x];
    const [nearY, farY] = viewPoint.y > center.y ? [max.y, min.y] : [min.y, max.y];
    const corner = new Vector3(nearX, nearY, min.z);

    this.addMeasurement(corner, new Vector3(farX, nearY, min.z));
    this.addMeasurement(corner, new Vector3(nearX, farY, min.z));
    this.addMeasurement(corner, new Vector3(nearX, nearY, max.z));

    const size = bounds.getSize(new Vector3());
    const box = new BoxGeometry(size.x, size.y, size.z);
    const outline = new LineSegments(this.track(new EdgesGeometry(box)), this.material);
    box.dispose();
    outline.position.copy(center);
    this.add(outline);
  }

  /**
   * Removes all measurements.
   */
  clear() {
    this.group.clear();
    this.geometries.forEach((geometry) => {
      geometry.dispose();
    });
    this.geometries.length = 0;
  }

  /**
   * Removes all measurements and frees the shared line material.
   */
  dispose() {
    this.clear();
    this.material.dispose();
  }

  /**
   * Draws a line between two points with its length labeled at the midpoint.
   */
  private addMeasurement(start: Vector3, end: Vector3) {
    this.add(new Line(this.track(new BufferGeometry().setFromPoints([start, end])), this.material));

    const element = document.createElement('div');
    element.className = this.labelClassName;
    element.textContent = `${start.distanceTo(end).toFixed(2)} m`;
    const label = new CSS2DObject(element);
    label.position.lerpVectors(start, end, 0.5);
    this.add(label);
  }

  /**
   * Adds an object to the overlay, drawn after the room so it sits on top.
   */
  private add(object: Object3D) {
    object.renderOrder = 1;
    this.group.add(object);
  }

  /**
   * Records a geometry so `clear` can free it.
   */
  private track(geometry: BufferGeometry): BufferGeometry {
    this.geometries.push(geometry);
    return geometry;
  }
}
