import { PerspectiveCamera, Vector3 } from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Where the camera sits and the point it orbits around.
 */
export type CameraPose = {
  position: Vector3;
  target: Vector3;
};

type Transition = {
  from: CameraPose;
  to: CameraPose;
  startTime: number;
};

const DURATION_MS = 700;

/**
 * Moves an orbit-controlled camera between poses with an eased transition.
 * Moves are instant when the user prefers reduced motion, and any manual
 * camera drag cancels a move partway through.
 */
export default class CameraMover {
  private transition: Transition | null = null;

  constructor(
    private readonly camera: PerspectiveCamera,
    private readonly controls: OrbitControls
  ) {
    controls.addEventListener('start', this.cancel);
  }

  /**
   * Finds the pose that fits a sphere of `radius` around `center` in view.
   *
   * @param direction Points from the center toward the camera. Defaults to
   * the camera's current viewing direction.
   */
  framePose(
    center: Vector3,
    radius: number,
    direction = this.camera.position.clone().sub(this.controls.target)
  ): CameraPose {
    const verticalFov = (this.camera.fov * Math.PI) / 180;
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * this.camera.aspect);
    const distance = (radius * 1.05) / Math.sin(Math.min(verticalFov, horizontalFov) / 2);
    return {
      position: center.clone().addScaledVector(direction.clone().normalize(), distance),
      target: center.clone()
    };
  }

  /**
   * Starts moving the camera to `pose`.
   */
  moveTo(pose: CameraPose) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.cancel();
      this.apply(pose.position, pose.target);
      return;
    }
    this.transition = {
      from: { position: this.camera.position.clone(), target: this.controls.target.clone() },
      to: pose,
      startTime: performance.now()
    };
  }

  /**
   * Advances the current move. Call once per rendered frame.
   */
  update() {
    if (!this.transition) return;
    const { from, to, startTime } = this.transition;
    const progress = Math.min((performance.now() - startTime) / DURATION_MS, 1);
    const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    this.apply(
      new Vector3().lerpVectors(from.position, to.position, eased),
      new Vector3().lerpVectors(from.target, to.target, eased)
    );
    if (progress === 1) this.transition = null;
  }

  /**
   * Stops listening to the controls.
   */
  dispose() {
    this.controls.removeEventListener('start', this.cancel);
  }

  /**
   * Stops the current move where it is.
   */
  private readonly cancel = () => {
    this.transition = null;
  };

  /**
   * Places the camera and its orbit target.
   */
  private apply(position: Vector3, target: Vector3) {
    this.camera.position.copy(position);
    this.controls.target.copy(target);
    this.controls.update();
  }
}
