import type { Manifold, ManifoldToplevel, Vec3 } from 'manifold-3d';
import { GlowPoint, ModelPart } from '../../services/ManifoldModel';
import HalloweenHouseModel, { FogBlob, HOUSE_PALETTE } from '../HalloweenHouseModel';

/**
 * A selectable object in the kitchen. One item is made of one or more parts.
 */
export enum KitchenItem {
  Room = 'Room',
  Cabinets = 'Cabinets',
  Appliances = 'Appliances',
  Bar = 'Bar',
  Fog = 'Fog',
  Uplight = 'Uplight',
  Potions = 'Potions',
  Food = 'Food',
  Drinks = 'Drinks',
  Candles = 'Candles'
}

/**
 * One handmade potion bottle standing on a surface.
 */
type Potion = {
  base: Vec3;
  color: string;
  /** A round-bottomed flask instead of a tall bottle. */
  round: boolean;
};

const ROOM_WIDTH = 4;
const ROOM_DEPTH = 3.6;
const CEILING_HEIGHT = 2.45;
const COUNTER_TOP = 0.91;
/** The top of the moss green creepy cloth lying on the bar. */
const BAR_TOP = COUNTER_TOP + 0.012;
const DOOR_Y = 0.1;
const LEDGE_TOP = 0.95;
const UPLIGHT_POSITION: Vec3 = [1.7, 0.3, 0];

const PALETTE = {
  tile: '#7c6756',
  wall: '#e2dac8',
  oak: '#c48b3f',
  darkOak: '#8a5a2b',
  counter: '#eeebe3',
  appliance: '#1c1c1e',
  burner: '#3a3a3c',
  steel: '#a9adb2',
  glass: '#a9d4ef',
  trim: '#f2f0ea',
  plant: '#3f7a3a',
  pot: '#b0643a',
  moss: '#8e9a6c',
  cork: '#c8a26a',
  crockPot: '#2a2a2a',
  crockLid: '#5a5a5c',
  plate: '#f4f1ea',
  cup: '#d8d2c4',
  cheese: '#e8b830',
  sourCream: '#f7f5ee',
  onion: '#7fae4f',
  pork: '#7b4a2e',
  bun: '#c98a4b',
  meatball: '#5e3a24',
  toothpick: '#e2c9a0',
  bread: '#b07a3e',
  dip: '#7c9a45',
  punch: '#c8782e',
  cider: '#8c3b1f',
  potionGreen: '#4fd16a',
  potionPurple: '#9b59d0',
  potionRed: '#d0473b',
  potionTeal: '#3fb5c9'
};

/**
 * The kitchen and bar set up for the party, based on a photo taken from the
 * entry way.
 *
 * The entry way is on the right (X = 4), looking toward -X. On the right,
 * along the back wall (+Y), are the fridge and the sink run with the
 * dishwasher. On the left, along the front (Y = 0), is the drawer counter
 * used as the bar. The far wall (X = 0) has the stove run with the upper
 * cabinets, the hood, and the opening onto the dining area with plants on
 * its ledge, and the sliding glass door to the patio at its left end.
 *
 * The wood grid ceiling isn't drawn so the room can be seen from above. Most
 * of the fluorescent tubes above it are taken out for the party to keep the
 * kitchen dim.
 */
export default class KitchenModel extends HalloweenHouseModel<KitchenItem> {
  readonly items = Object.values(KitchenItem);
  readonly parts: ModelPart<KitchenItem>[];
  override readonly glowPoints: GlowPoint[] = [
    { position: [UPLIGHT_POSITION[0], UPLIGHT_POSITION[1], 0.35], color: HOUSE_PALETTE.green },
    { position: [1.4, 3.1, 1.05], color: HOUSE_PALETTE.flame }
  ];

  constructor(wasm: ManifoldToplevel) {
    super(wasm);
    this.parts = [
      ...this.buildRoom(),
      ...this.buildCabinets(),
      ...this.buildAppliances(),
      ...this.buildBar(),
      ...this.buildFog(),
      ...this.uplight(KitchenItem.Uplight, UPLIGHT_POSITION, HOUSE_PALETTE.green),
      ...this.buildPotions(),
      ...this.buildFood(),
      ...this.buildDrinks(),
      ...this.teaLights(KitchenItem.Candles, [
        [2.1, 3.08, COUNTER_TOP],
        [1.3, 3.08, COUNTER_TOP],
        [0.75, 3.08, COUNTER_TOP],
        [0.5, 2.75, COUNTER_TOP],
        [0.52, 2.33, COUNTER_TOP],
        [3.38, 0.48, BAR_TOP]
      ])
    ];
  }

  /**
   * Builds the tile floor, the walls with the sliding door and the opening
   * over the stove run, and the sliding door's frame and glass.
   */
  private buildRoom(): ModelPart<KitchenItem>[] {
    const doorHole = this.box([0.3, 1.35, 2.05], [-0.2, DOOR_Y, 0]);
    const passThrough = this.box([0.3, 1.6, 0.47], [-0.2, 1.55, LEDGE_TOP]);
    const shell = this.shell(KitchenItem.Room, {
      size: [ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT],
      floorColor: PALETTE.tile,
      wallColor: PALETTE.wall,
      openings: [doorHole, passThrough]
    });

    // The sliding door is a frame around the opening with a post where the
    // two glass panels meet.
    const doorFrame = this.union([
      this.subtract(
        this.box([0.06, 1.45, 2.1], [-0.08, DOOR_Y - 0.05, 0]),
        this.box([0.2, 1.35, 2.05], [-0.15, DOOR_Y, -0.01])
      ),
      this.box([0.06, 0.05, 2.05], [-0.08, DOOR_Y + 0.65, 0])
    ]);
    const doorGlass = this.box([0.01, 1.35, 2.05], [-0.05, DOOR_Y, 0]);

    return [
      ...shell,
      this.part(KitchenItem.Room, 'Sliding door frame', PALETTE.trim, doorFrame),
      {
        ...this.part(KitchenItem.Room, 'Sliding door glass', PALETTE.glass, doorGlass),
        transparent: true
      }
    ];
  }

  /**
   * Builds the oak base and upper cabinets along the back and far walls,
   * their countertops with the sink cut in, and the plant ledge in the
   * opening over the stove run.
   */
  private buildCabinets(): ModelPart<KitchenItem>[] {
    const sink = this.box([0.55, 0.42, 0.2], [2.4, 3.08, COUNTER_TOP - 0.19]);
    const backBase = this.box([2.52, 0.6, 0.88], [0.6, 3.0, 0]);
    const farBase = this.box([0.6, 1.34, 0.88], [0, 2.26, 0]);
    // Thin grooves on the cabinet fronts mark the drawer line and the doors.
    const grooves = this.union([
      this.box([2.52, 0.02, 0.01], [0.6, 2.99, 0.7]),
      this.box([0.02, 1.34, 0.01], [0.59, 2.26, 0.7]),
      ...[1.15, 1.65, 2.25].map((x) => this.box([0.01, 0.02, 0.62], [x, 2.99, 0.06])),
      ...[2.9, 3.45].map((y) => this.box([0.02, 0.01, 0.62], [0.59, y, 0.06]))
    ]);
    const bases = this.subtract(this.union([backBase, farBase]), this.union([sink, grooves]));
    const uppers = this.union([
      this.box([2.77, 0.33, 0.75], [0.33, 3.27, 1.45]),
      this.box([0.33, 2.1, 0.75], [0, 1.5, 1.45])
    ]);
    const tops = this.subtract(
      this.union([
        this.box([2.52, 0.62, 0.03], [0.6, 2.98, COUNTER_TOP - 0.03]),
        this.box([0.62, 1.34, 0.03], [0, 2.26, COUNTER_TOP - 0.03])
      ]),
      sink
    );

    const ledge = this.box([0.32, 1.6, 0.03], [-0.3, 1.55, LEDGE_TOP - 0.03]);
    const plantSpots: Vec3[] = [
      [-0.15, 1.7, LEDGE_TOP],
      [-0.14, 2.2, LEDGE_TOP],
      [-0.15, 2.8, LEDGE_TOP]
    ];
    const pots = plantSpots.map((spot) => this.cylinder(0.08, 0.04, 0.055, spot, 20));
    const leaves = plantSpots.map(([x, y, z]) =>
      this.ellipsoid([0.07, 0.07, 0.09], [x, y, z + 0.15])
    );

    return [
      this.part(KitchenItem.Cabinets, 'Base cabinets', PALETTE.oak, bases),
      this.part(KitchenItem.Cabinets, 'Upper cabinets', PALETTE.oak, uppers),
      this.part(KitchenItem.Cabinets, 'Countertops', PALETTE.counter, tops),
      this.part(KitchenItem.Cabinets, 'Plant ledge', PALETTE.darkOak, ledge),
      this.part(KitchenItem.Cabinets, 'Plant pots', PALETTE.pot, this.union(pots)),
      this.part(KitchenItem.Cabinets, 'Plants', PALETTE.plant, this.union(leaves))
    ];
  }

  /**
   * Builds the fridge just inside the entry, the stove at the end of the
   * far run with the range hood above it, and the dishwasher.
   */
  private buildAppliances(): ModelPart<KitchenItem>[] {
    // The fridge doors face into the room, toward the bar.
    const fridge = this.subtract(
      this.box([0.75, 0.75, 1.75], [3.15, 2.85, 0]),
      this.box([0.77, 0.02, 0.02], [3.14, 2.84, 1.15])
    );
    const handles = this.union([
      this.capsule([3.8, 2.82, 0.55], [3.8, 2.82, 1.05], 0.012),
      this.capsule([3.8, 2.82, 1.25], [3.8, 2.82, 1.6], 0.012)
    ]);

    const stove = this.union([
      this.box([0.6, 0.76, COUNTER_TOP], [0, 1.5, 0]),
      this.box([0.08, 0.76, 0.12], [0, 1.5, COUNTER_TOP])
    ]);
    const ovenWindow = this.box([0.01, 0.5, 0.3], [0.595, 1.63, 0.3]);
    const burners = [
      [0.45, 1.7],
      [0.45, 2.06],
      [0.18, 1.7],
      [0.18, 2.06]
    ].map(([x, y]) => this.cylinder(0.008, 0.08, 0.08, [x, y, COUNTER_TOP], 24));
    const hood = this.box([0.5, 0.76, 0.12], [0, 1.5, 1.33]);
    const dishwasher = this.box([0.6, 0.02, 0.8], [1.65, 2.985, 0.06]);

    return [
      this.part(KitchenItem.Appliances, 'Fridge', PALETTE.appliance, fridge),
      this.part(KitchenItem.Appliances, 'Fridge handles', PALETTE.steel, handles),
      this.part(KitchenItem.Appliances, 'Stove', PALETTE.appliance, stove),
      this.part(KitchenItem.Appliances, 'Oven window', PALETTE.burner, ovenWindow),
      this.part(KitchenItem.Appliances, 'Burners', PALETTE.burner, this.union(burners)),
      this.part(KitchenItem.Appliances, 'Range hood', PALETTE.appliance, hood),
      this.part(KitchenItem.Appliances, 'Dishwasher', PALETTE.appliance, dishwasher)
    ];
  }

  /**
   * Builds the bar: the drawer counter along the front with the moss green
   * creepy cloth along its top and Spanish moss along its edge.
   *
   * The photos don't show where the bar is, so this places it at the drawer
   * counter by the entry, the counter farthest from the stove, with the
   * space between its far end and the sliding door as the small area behind
   * it.
   */
  private buildBar(): ModelPart<KitchenItem>[] {
    const body = this.box([1.35, 0.6, 0.88], [2.45, 0, 0]);
    const drawers = [2.5, 3.15].flatMap((x) =>
      [0.08, 0.32, 0.56].map((z) => this.box([0.6, 0.02, 0.2], [x, 0.59, z]))
    );
    const cabinet = this.subtract(body, this.union(drawers));
    const top = this.box([1.37, 0.63, 0.03], [2.44, 0, COUNTER_TOP - 0.03]);

    // The runner covers the top and hangs down the front, plus a longer
    // panel over the end next to the fog machine.
    const runner = this.union([
      this.drape([2.44, 0, 0.6], [3.81, 0.63, COUNTER_TOP]),
      this.clothPanel([2.415, 0, COUNTER_TOP], [2.415, 0.645, COUNTER_TOP], 0.75)
    ]);

    const mossSpots = [3.65, 3.3, 2.95, 2.6];
    const moss = this.union(
      mossSpots.flatMap((x, index) => [
        this.ellipsoid([0.09, 0.06, 0.025], [x, 0.58, BAR_TOP]),
        this.capsule([x + 0.03, 0.65, BAR_TOP - 0.01], [x + 0.02, 0.66, 0.7 - index * 0.04], 0.008),
        this.capsule([x - 0.03, 0.65, BAR_TOP - 0.01], [x - 0.05, 0.665, 0.6 + index * 0.03], 0.008)
      ])
    );

    return [
      this.part(KitchenItem.Bar, 'Bar cabinet', PALETTE.oak, cabinet),
      this.part(KitchenItem.Bar, 'Bar top', PALETTE.counter, top),
      this.part(KitchenItem.Bar, 'Moss green creepy cloth', HOUSE_PALETTE.mossCloth, runner),
      this.part(KitchenItem.Bar, 'Spanish moss', PALETTE.moss, moss)
    ];
  }

  /**
   * Builds fog machine 2 in the space behind the bar, blowing out into the
   * room through its chiller, and the fog rolling across the floor and over
   * the bar top.
   */
  private buildFog(): ModelPart<KitchenItem>[] {
    const blobs: FogBlob[] = [
      { center: [2.15, 1.45, 0.12], radii: [0.3, 0.35, 0.12] },
      { center: [2.8, 1.2, 0.1], radii: [0.45, 0.5, 0.1] },
      { center: [3.4, 1.0, 0.08], radii: [0.4, 0.4, 0.08] },
      { center: [1.6, 1.6, 0.08], radii: [0.35, 0.4, 0.08] },
      { center: [2.75, 0.4, 1.0], radii: [0.35, 0.28, 0.07] }
    ];
    return [
      ...this.fogMachine(KitchenItem.Fog, [2.15, 0.08, 0], 90),
      this.fog(KitchenItem.Fog, blobs)
    ];
  }

  /**
   * Builds the handmade potion bottles on the bar and on the plant ledge.
   */
  private buildPotions(): ModelPart<KitchenItem>[] {
    const potions: Potion[] = [
      { base: [3.05, 0.2, BAR_TOP], color: PALETTE.potionGreen, round: false },
      { base: [2.92, 0.42, BAR_TOP], color: PALETTE.potionPurple, round: true },
      { base: [2.78, 0.22, BAR_TOP], color: PALETTE.potionRed, round: false },
      { base: [2.62, 0.45, BAR_TOP], color: PALETTE.potionTeal, round: true },
      { base: [-0.15, 1.95, LEDGE_TOP], color: PALETTE.potionPurple, round: false },
      { base: [-0.12, 2.48, LEDGE_TOP], color: PALETTE.potionGreen, round: true },
      { base: [-0.15, 3.05, LEDGE_TOP], color: PALETTE.potionRed, round: false }
    ];
    const corks = potions.map(({ base, round }) => {
      const neckTop = base[2] + (round ? 0.15 : 0.2);
      return this.cylinder(0.025, 0.016, 0.016, [base[0], base[1], neckTop], 12);
    });
    return [
      ...potions.map(({ base, color, round }) =>
        this.part(KitchenItem.Potions, 'Potion bottle', color, this.potionBottle(base, round))
      ),
      this.part(KitchenItem.Potions, 'Corks', PALETTE.cork, this.union(corks))
    ];
  }

  /**
   * Creates one potion bottle with its neck, without the cork. A tall bottle
   * is 0.2 m to the top of its neck and a round flask is 0.15 m.
   */
  private potionBottle(base: Vec3, round: boolean): Manifold {
    const [x, y, z] = base;
    if (round) {
      return this.union([
        this.sphere(0.05, [x, y, z + 0.05]),
        this.cylinder(0.07, 0.014, 0.014, [x, y, z + 0.08], 12)
      ]);
    }
    return this.union([
      this.cylinder(0.14, 0.032, 0.032, [x, y, z], 20),
      this.cylinder(0.06, 0.032, 0.013, [x, y, z + 0.14], 20)
    ]);
  }

  /**
   * Builds the hot food on the counters away from the bar: the chili crock
   * pot with cups and toppings, the pulled pork and slider buns, the
   * meatballs with toothpicks, and the dip in its bread bowl.
   */
  private buildFood(): ModelPart<KitchenItem>[] {
    const crockPot = this.union([
      this.cylinder(0.2, 0.15, 0.15, [1.95, 3.3, COUNTER_TOP]),
      this.sphere(0.02, [1.95, 3.3, COUNTER_TOP + 0.25])
    ]);
    const crockLid = this.ellipsoid([0.15, 0.15, 0.04], [1.95, 3.3, COUNTER_TOP + 0.2]);
    const cups = [1.7, 1.58].map((x) =>
      this.cylinder(0.12, 0.035, 0.045, [x, 3.13, COUNTER_TOP], 16)
    );
    const toppingBowls: [number, string][] = [
      [1.72, PALETTE.cheese],
      [1.59, PALETTE.sourCream],
      [1.46, PALETTE.onion]
    ];
    const bowls = toppingBowls.map(([x]) =>
      this.subtract(
        this.cylinder(0.045, 0.04, 0.055, [x, 3.43, COUNTER_TOP], 20),
        this.cylinder(0.04, 0.035, 0.05, [x, 3.43, COUNTER_TOP + 0.01], 20)
      )
    );
    const toppings = toppingBowls.map(([x, color]) =>
      this.part(
        KitchenItem.Food,
        'Chili topping',
        color,
        this.cylinder(0.01, 0.045, 0.045, [x, 3.43, COUNTER_TOP + 0.03], 20)
      )
    );

    const porkDish = this.subtract(
      this.box([0.3, 0.22, 0.05], [1.03, 3.19, COUNTER_TOP]),
      this.box([0.27, 0.19, 0.05], [1.045, 3.205, COUNTER_TOP + 0.01])
    );
    const pork = this.union(
      [1.26, 1.18, 1.1].flatMap((x) =>
        [3.25, 3.35].map((y) => this.ellipsoid([0.05, 0.05, 0.025], [x, y, COUNTER_TOP + 0.035]))
      )
    );
    const bunPlate = this.cylinder(0.015, 0.16, 0.16, [0.85, 3.3, COUNTER_TOP]);
    const buns = this.union(
      [0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (index / 6) * 2 * Math.PI;
        return this.ellipsoid(
          [0.04, 0.04, 0.025],
          [0.85 + 0.09 * Math.cos(angle), 3.3 + 0.09 * Math.sin(angle), COUNTER_TOP + 0.02]
        );
      })
    );

    const meatballDish = this.cylinder(0.03, 0.12, 0.13, [0.32, 2.95, COUNTER_TOP]);
    const meatballSpots = [-0.06, 0, 0.06].flatMap((dx) =>
      [-0.06, 0, 0.06].map((dy) => [0.32 + dx, 2.95 + dy])
    );
    const meatballs = this.union(
      meatballSpots.map(([x, y]) => this.sphere(0.024, [x, y, COUNTER_TOP + 0.05]))
    );
    const toothpicks = this.union(
      meatballSpots
        .filter((_, index) => index % 2 === 0)
        .map(([x, y]) =>
          this.capsule([x, y, COUNTER_TOP + 0.05], [x, y + 0.01, COUNTER_TOP + 0.13], 0.003)
        )
    );

    // The bread bowl is a loaf with its top sliced off and its middle
    // scooped out, filled with dip.
    const breadBowl = this.subtract(
      this.subtract(
        this.ellipsoid([0.12, 0.12, 0.09], [0.32, 2.5, COUNTER_TOP + 0.08]),
        this.box([0.3, 0.3, 0.1], [0.17, 2.35, COUNTER_TOP + 0.13])
      ),
      this.ellipsoid([0.09, 0.09, 0.06], [0.32, 2.5, COUNTER_TOP + 0.13])
    );
    const dip = this.ellipsoid([0.09, 0.09, 0.015], [0.32, 2.5, COUNTER_TOP + 0.11]);
    const breadsticks = this.union(
      [
        [0.06, -0.06],
        [0.03, 0.06],
        [-0.06, 0],
        [-0.045, -0.075]
      ].map(([dx, dy]) =>
        this.capsule(
          [0.12, 2.4, COUNTER_TOP + 0.01],
          [0.12 + dx, 2.4 + dy, COUNTER_TOP + 0.24],
          0.008
        )
      )
    );

    return [
      this.part(KitchenItem.Food, 'Chili crock pot', PALETTE.crockPot, crockPot),
      this.part(KitchenItem.Food, 'Crock pot lid', PALETTE.crockLid, crockLid),
      this.part(KitchenItem.Food, 'Chili cups', PALETTE.cup, this.union(cups)),
      this.part(KitchenItem.Food, 'Topping bowls', PALETTE.plate, this.union(bowls)),
      ...toppings,
      this.part(
        KitchenItem.Food,
        'Serving dishes',
        PALETTE.plate,
        this.union([porkDish, bunPlate, meatballDish])
      ),
      this.part(KitchenItem.Food, 'Pulled pork', PALETTE.pork, pork),
      this.part(KitchenItem.Food, 'Slider buns', PALETTE.bun, buns),
      this.part(KitchenItem.Food, 'Swedish meatballs', PALETTE.meatball, meatballs),
      this.part(KitchenItem.Food, 'Toothpicks', PALETTE.toothpick, toothpicks),
      this.part(
        KitchenItem.Food,
        'Bread bowl',
        PALETTE.bread,
        this.union([breadBowl, breadsticks])
      ),
      this.part(KitchenItem.Food, 'Swamp moss dip', PALETTE.dip, dip)
    ];
  }

  /**
   * Builds the punch dispenser and glasses at the end of the bar away from
   * the fog machine, and the pot of mulled cider on the stove.
   */
  private buildDrinks(): ModelPart<KitchenItem>[] {
    const [x, y] = [3.58, 0.3];
    const stand = this.box([0.22, 0.22, 0.08], [x - 0.11, y - 0.11, BAR_TOP]);
    const jar = this.cylinder(0.28, 0.1, 0.1, [x, y, BAR_TOP + 0.08]);
    const punch = this.cylinder(0.2, 0.09, 0.09, [x, y, BAR_TOP + 0.09]);
    const lidAndSpigot = this.union([
      this.cylinder(0.02, 0.1, 0.1, [x, y, BAR_TOP + 0.36]),
      this.box([0.025, 0.06, 0.025], [x - 0.0125, y + 0.09, BAR_TOP + 0.1])
    ]);
    const glasses = [3.3, 3.2].flatMap((glassX) =>
      [0.2, 0.3, 0.4].map((glassY) =>
        this.cylinder(0.1, 0.03, 0.035, [glassX, glassY, BAR_TOP], 16)
      )
    );

    const pot = this.subtract(
      this.cylinder(0.15, 0.12, 0.12, [0.45, 1.7, COUNTER_TOP + 0.008]),
      this.cylinder(0.15, 0.11, 0.11, [0.45, 1.7, COUNTER_TOP + 0.02])
    );
    const cider = this.cylinder(0.1, 0.11, 0.11, [0.45, 1.7, COUNTER_TOP + 0.02]);

    return [
      this.part(
        KitchenItem.Drinks,
        'Dispenser stand',
        PALETTE.appliance,
        this.union([stand, lidAndSpigot])
      ),
      { ...this.part(KitchenItem.Drinks, 'Dispenser jar', PALETTE.glass, jar), transparent: true },
      this.part(KitchenItem.Drinks, 'Poisoned apple punch', PALETTE.punch, punch),
      {
        ...this.part(KitchenItem.Drinks, 'Glasses', PALETTE.glass, this.union(glasses)),
        transparent: true
      },
      this.part(KitchenItem.Drinks, 'Cider pot', PALETTE.steel, pot),
      this.part(KitchenItem.Drinks, 'Mulled cider', PALETTE.cider, cider)
    ];
  }
}
