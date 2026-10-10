import { PerspectiveCamera, Vector3 } from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Lets an orbit-controlled camera keep zooming in past its orbit target.
 *
 * OrbitControls zooms by scaling the camera's distance to the target, so each
 * step covers less ground and the camera stalls as it nears the target. When
 * a zoom brings the camera closer than `minTargetDistance` (or closer than it
 * started, if it started closer), the target is pushed ahead along the view
 * direction. Further zooming then moves the camera forward at a steady pace,
 * and the camera keeps orbiting around a point just in front of it.
 */
export default class ZoomThroughTarget {
  private startDistance = 0;

  constructor(
    private readonly camera: PerspectiveCamera,
    private readonly controls: OrbitControls,
    private readonly minTargetDistance: number
  ) {
    controls.addEventListener('start', this.handleStart);
    controls.addEventListener('end', this.handleEnd);
  }

  /**
   * Stops listening to the controls.
   */
  dispose() {
    this.controls.removeEventListener('start', this.handleStart);
    this.controls.removeEventListener('end', this.handleEnd);
  }

  /**
   * Records the target distance before a gesture changes it.
   */
  private readonly handleStart = () => {
    this.startDistance = this.targetDistance();
  };

  /**
   * Pushes the target ahead of the camera if the gesture brought them too close.
   */
  private readonly handleEnd = () => {
    const floor = Math.min(this.minTargetDistance, this.startDistance);
    if (this.targetDistance() >= floor) return;
    const forward = this.camera.getWorldDirection(new Vector3());
    this.controls.target.copy(this.camera.position).addScaledVector(forward, floor);
    this.controls.update();
  };

  /**
   * The distance from the camera to the orbit target.
   */
  private targetDistance(): number {
    return this.camera.position.distanceTo(this.controls.target);
  }
}
