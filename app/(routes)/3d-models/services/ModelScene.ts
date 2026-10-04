import type { Box, Manifold } from 'manifold-3d';
import {
  AmbientLight,
  Box3,
  BufferAttribute,
  BufferGeometry,
  DirectionalLight,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Raycaster,
  Scene,
  ShadowMaterial,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import CameraMover, { CameraPose } from './CameraMover';
import DimensionOverlay from './DimensionOverlay';
import ManifoldModel, { ModelPart } from './ManifoldModel';

/**
 * The page elements and callbacks a ModelScene draws into and reports to.
 */
export type ModelSceneOptions<TItem extends string> = {
  canvas: HTMLCanvasElement;
  /** An element covering the canvas that holds the HTML measurement labels. */
  labelLayer: HTMLElement;
  labelClassName: string;
  onSelect: (item: TItem | null) => void;
};

type ModelMesh = Mesh<BufferGeometry, MeshStandardMaterial>;

/** Points from the model toward the camera's starting position. */
const HOME_DIRECTION = new Vector3(1, -0.8, 0.65);
/** Points from the model toward the sun. */
const SUN_DIRECTION = new Vector3(0.6, -0.3, 0.7).normalize();
/** Edges that bend more than this many degrees render sharp instead of smooth. */
const SHARP_EDGE_ANGLE = 50;
const HIGHLIGHT_COLOR = '#ffb347';
const NO_HIGHLIGHT_COLOR = '#000000';
/** Pointer travel, in pixels, beyond which a press counts as a drag rather than a click. */
const CLICK_TOLERANCE = 4;

/**
 * Renders a ManifoldModel with three.js inside a canvas. Dragging orbits the
 * camera, and clicking an item highlights it, moves the camera to frame it,
 * and shows its dimensions.
 *
 * Manifold uses a Z-up coordinate system, so the camera's up vector is set to
 * +Z instead of converting every mesh.
 */
export default class ModelScene<TItem extends string> {
  private readonly canvas: HTMLCanvasElement;
  private readonly onSelect: (item: TItem | null) => void;
  private readonly renderer: WebGLRenderer;
  private readonly labelRenderer: CSS2DRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(45, 1, 0.01, 100);
  private readonly controls: OrbitControls;
  private readonly cameraMover: CameraMover;
  private readonly dimensions: DimensionOverlay;
  private readonly raycaster = new Raycaster();
  private readonly resizeObserver: ResizeObserver;
  private readonly ground: Mesh<PlaneGeometry, ShadowMaterial>;
  private readonly meshes: ModelMesh[];
  private readonly meshItems = new Map<Object3D, TItem>();
  private readonly homePose: CameraPose;
  private pointerDownAt = new Vector2();

  /**
   * The renderer draws with a transparent background, so the canvas's CSS
   * background shows behind the model.
   */
  constructor(
    private readonly model: ManifoldModel<TItem>,
    { canvas, labelLayer, labelClassName, onSelect }: ModelSceneOptions<TItem>
  ) {
    this.canvas = canvas;
    this.onSelect = onSelect;
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    this.labelRenderer = new CSS2DRenderer({ element: labelLayer });

    this.camera.up.set(0, 0, 1);
    this.controls = new OrbitControls(this.camera, canvas);
    this.cameraMover = new CameraMover(this.camera, this.controls);
    this.dimensions = new DimensionOverlay(this.scene, labelClassName);

    const bounds = ModelScene.toBox3(model.getBounds());
    const center = bounds.getCenter(new Vector3());
    const radius = bounds.getSize(new Vector3()).length() / 2;
    this.addLights(center, radius);
    this.ground = this.addGround(center, radius, bounds.min.z);
    this.meshes = model.parts.map((part) => this.addPart(part));

    canvas.addEventListener('pointerdown', this.handlePointerDown);
    canvas.addEventListener('pointerup', this.handlePointerUp);
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(canvas);
    this.resize();

    this.homePose = this.cameraMover.framePose(center, radius, HOME_DIRECTION);
    this.camera.position.copy(this.homePose.position);
    this.controls.target.copy(this.homePose.target);
    this.controls.update();

    this.renderer.setAnimationLoop(() => {
      this.cameraMover.update();
      this.renderer.render(this.scene, this.camera);
      this.labelRenderer.render(this.scene, this.camera);
    });
  }

  /**
   * Highlights an item, frames it with the camera, and shows its dimensions.
   * Passing null clears the selection and leaves the camera where it is.
   */
  select(item: TItem | null) {
    this.meshes.forEach((mesh) => {
      const selected = item !== null && this.meshItems.get(mesh) === item;
      mesh.material.emissive.set(selected ? HIGHLIGHT_COLOR : NO_HIGHLIGHT_COLOR);
      mesh.material.emissiveIntensity = 0.25;
    });
    this.onSelect(item);

    if (item === null) {
      this.dimensions.clear();
      return;
    }
    const bounds = ModelScene.toBox3(this.model.getItemBounds(item));
    const pose = this.cameraMover.framePose(
      bounds.getCenter(new Vector3()),
      bounds.getSize(new Vector3()).length() / 2
    );
    this.dimensions.show(bounds, pose.position);
    this.cameraMover.moveTo(pose);
  }

  /**
   * Clears the selection and moves the camera back to its starting view.
   */
  resetView() {
    this.select(null);
    this.cameraMover.moveTo({
      position: this.homePose.position.clone(),
      target: this.homePose.target.clone()
    });
  }

  /**
   * Stops rendering and frees all GPU resources held by the scene.
   */
  dispose() {
    this.renderer.setAnimationLoop(null);
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.resizeObserver.disconnect();
    this.cameraMover.dispose();
    this.controls.dispose();
    this.dimensions.dispose();
    [...this.meshes, this.ground].forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    this.renderer.dispose();
  }

  /**
   * Converts a Manifold box into a three.js box.
   */
  private static toBox3({ min, max }: Box): Box3 {
    return new Box3(new Vector3(...min), new Vector3(...max));
  }

  /**
   * Converts a Manifold solid into a three.js geometry. Manifold calculates
   * the normals, so curved surfaces shade smoothly while edges sharper than
   * SHARP_EDGE_ANGLE stay crisp.
   */
  private static toGeometry(manifold: Manifold): BufferGeometry {
    const withNormals = manifold.calculateNormals(0, SHARP_EDGE_ANGLE);
    const { vertProperties, numProp, triVerts } = withNormals.getMesh();
    withNormals.delete();

    // Each vertex is [x, y, z, normalX, normalY, normalZ, ...].
    const vertices = new InterleavedBuffer(vertProperties, numProp);
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new InterleavedBufferAttribute(vertices, 3, 0));
    geometry.setAttribute('normal', new InterleavedBufferAttribute(vertices, 3, 3));
    geometry.setIndex(new BufferAttribute(triVerts, 1));
    return geometry;
  }

  /**
   * Records where a press starts so the release can tell a click from a drag.
   */
  private readonly handlePointerDown = (event: PointerEvent) => {
    this.pointerDownAt = new Vector2(event.clientX, event.clientY);
  };

  /**
   * Selects the item under the pointer on a click. Clicking empty space
   * clears the selection.
   */
  private readonly handlePointerUp = (event: PointerEvent) => {
    const pointer = new Vector2(event.clientX, event.clientY);
    if (pointer.distanceTo(this.pointerDownAt) > CLICK_TOLERANCE) return;

    const { left, top, width, height } = this.canvas.getBoundingClientRect();
    const normalizedPointer = new Vector2(
      ((event.clientX - left) / width) * 2 - 1,
      -((event.clientY - top) / height) * 2 + 1
    );
    this.raycaster.setFromCamera(normalizedPointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.meshes, false).at(0);
    this.select(hit ? (this.meshItems.get(hit.object) ?? null) : null);
  };

  /**
   * Adds soft fill light, a sun whose shadows cover the whole model, and a
   * warm light at each of the model's glow points.
   */
  private addLights(center: Vector3, radius: number) {
    this.scene.add(new AmbientLight(0xffffff, 1.3));

    const sun = new DirectionalLight(0xfff4e0, 2.2);
    sun.position.copy(center).addScaledVector(SUN_DIRECTION, radius * 3);
    sun.target.position.copy(center);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -radius;
    sun.shadow.camera.right = radius;
    sun.shadow.camera.top = radius;
    sun.shadow.camera.bottom = -radius;
    sun.shadow.camera.near = radius;
    sun.shadow.camera.far = radius * 6;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun, sun.target);

    this.model.glowPoints.forEach((position) => {
      const glow = new PointLight(0xffc77a, 1.5, 3);
      glow.position.set(...position);
      this.scene.add(glow);
    });
  }

  /**
   * Adds an invisible ground plane under the model that only shows shadows.
   */
  private addGround(
    center: Vector3,
    radius: number,
    floorHeight: number
  ): Mesh<PlaneGeometry, ShadowMaterial> {
    const ground = new Mesh(
      new PlaneGeometry(radius * 6, radius * 6),
      new ShadowMaterial({ opacity: 0.2 })
    );
    ground.position.set(center.x, center.y, floorHeight);
    ground.receiveShadow = true;
    this.scene.add(ground);
    return ground;
  }

  /**
   * Adds one model part to the scene as a shaded mesh tagged with its item.
   */
  private addPart(part: ModelPart<TItem>): ModelMesh {
    const material = new MeshStandardMaterial({
      color: part.color,
      roughness: 0.8,
      transparent: part.transparent ?? false,
      opacity: part.transparent ? 0.35 : 1
    });
    const mesh = new Mesh(ModelScene.toGeometry(part.manifold), material);
    mesh.name = part.name;
    mesh.castShadow = !part.transparent;
    mesh.receiveShadow = true;
    this.meshItems.set(mesh, part.item);
    this.scene.add(mesh);
    return mesh;
  }

  /**
   * Matches the renderers and camera to the canvas's current CSS size.
   */
  private resize() {
    const { clientWidth, clientHeight } = this.canvas;
    if (clientWidth === 0 || clientHeight === 0) return;
    this.renderer.setSize(clientWidth, clientHeight, false);
    this.labelRenderer.setSize(clientWidth, clientHeight);
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
  }
}
