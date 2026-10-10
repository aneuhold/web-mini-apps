import type { Manifold, Vec3 } from 'manifold-3d';
import type { ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

/**
 * A material that pieces of more than one dish are made of. Every piece of
 * one material shares a part name, so a scene combines them into one part.
 */
export enum FoodMaterial {
  Plates = 'Plates',
  ServingDishes = 'ServingDishes',
  Cheese = 'Cheese',
  PretzelsNutsAndPicks = 'PretzelsNutsAndPicks',
  MozzarellaAndMeringue = 'MozzarellaAndMeringue',
  Chocolate = 'Chocolate',
  ClearPlastic = 'ClearPlastic'
}

/**
 * How the part for one food material is named and drawn.
 */
type MaterialLook = {
  name: string;
  color: string;
  transparent: boolean;
};

const DISH_COLOR = '#f7f5ef';

const MATERIAL_LOOKS: Record<FoodMaterial, MaterialLook> = {
  [FoodMaterial.Plates]: { name: 'Plates', color: DISH_COLOR, transparent: false },
  [FoodMaterial.ServingDishes]: {
    name: 'Bowls and serving dishes',
    color: DISH_COLOR,
    transparent: false
  },
  [FoodMaterial.Cheese]: { name: 'Cheese', color: '#f0c75a', transparent: false },
  [FoodMaterial.PretzelsNutsAndPicks]: {
    name: 'Pretzels, nuts, and picks',
    color: '#b07a3e',
    transparent: false
  },
  [FoodMaterial.MozzarellaAndMeringue]: {
    name: 'Mozzarella and meringue mushrooms',
    color: '#f6f1e4',
    transparent: false
  },
  [FoodMaterial.Chocolate]: { name: 'Chocolate', color: '#3b2418', transparent: false },
  [FoodMaterial.ClearPlastic]: { name: 'Clear cups and jar', color: '#e6f2f8', transparent: true }
};

/**
 * Base class for party food made partly of materials other dishes share,
 * such as plates, chocolate, or meringue. Adds the parts for those materials
 * and builders for the pieces more than one dish has.
 */
export default abstract class FoodAsset extends HalloweenHouseAsset {
  /**
   * Creates the part for the pieces of a dish made of a shared material.
   */
  protected foodPart(material: FoodMaterial, manifold: Manifold): ModelPart {
    const { name, color, transparent } = MATERIAL_LOOKS[material];
    return { ...this.part(name, color, manifold), transparent };
  }

  /**
   * Creates a thin round plate standing on `center`.
   */
  protected plate(radius: number, center: Vec3): Manifold {
    return this.cylinder(0.012, radius, radius, center, 40);
  }

  /**
   * Creates a small meringue mushroom standing on `base`.
   */
  protected meringueMushroom(base: Vec3): Manifold {
    const [x, y, z] = base;
    return this.union([
      this.cylinder(0.012, 0.005, 0.004, base, 12),
      this.ellipsoid([0.011, 0.011, 0.007], [x, y, z + 0.014], 12)
    ]);
  }
}
