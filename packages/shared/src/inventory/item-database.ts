import { ItemDefinition } from '../types.js';

export const ITEM_DATABASE: Record<string, ItemDefinition> = {
  item_small_herb: {
    id: 'item_small_herb',
    name: 'Small Herb (สมุนไพรเล็ก)',
    type: 'hp_restore',
    effectValue: 50,
    description: 'A soothing wild herb that restores 50 HP to a single ally.',
    price: 10,
    sellPrice: 5,
    stackMax: 99,
    usableInCombat: true,
    usableOnOverworld: true
  },
  item_ginseng: {
    id: 'item_ginseng',
    name: 'Ginseng (โสม)',
    type: 'sp_restore',
    effectValue: 40,
    description: 'A prized mountain root that restores 40 SP to a single ally.',
    price: 25,
    sellPrice: 12,
    stackMax: 99,
    usableInCombat: true,
    usableOnOverworld: true
  },
  item_steamed_bun: {
    id: 'item_steamed_bun',
    name: 'Steamed Bun (ซาลาเปา)',
    type: 'hp_restore',
    effectValue: 80,
    description: 'A hot, freshly steamed bun that restores 80 HP to a single ally.',
    price: 20,
    stackMax: 99,
    usableInCombat: true,
    usableOnOverworld: true
  },
  item_herbal_tea: {
    id: 'item_herbal_tea',
    name: 'Herbal Tea (ชาสมุนไพร)',
    type: 'sp_restore',
    effectValue: 50,
    description: 'Refreshing brewed tea that restores 50 SP to a single ally.',
    price: 30,
    stackMax: 99,
    usableInCombat: true,
    usableOnOverworld: true
  },
  item_vitality_pill: {
    id: 'item_vitality_pill',
    name: 'Vitality Pill (ยาฟื้นพลัง)',
    type: 'hp_restore',
    effectValue: 200,
    description: 'A potent medicinal herb pill restoring 200 HP to a single ally.',
    price: 80,
    stackMax: 99,
    usableInCombat: true,
    usableOnOverworld: true
  },
  item_phoenix_feather: {
    id: 'item_phoenix_feather',
    name: 'Phoenix Feather (ขนนกฟีนิกซ์)',
    type: 'revive',
    effectValue: 100,
    description: 'A mystical glowing feather that revives a fallen ally with 100 HP.',
    price: 150,
    stackMax: 20,
    usableInCombat: true,
    usableOnOverworld: true
  },
  item_town_scroll: {
    id: 'item_town_scroll',
    name: 'Town Scroll (ใบวาร์ปกลับเมือง)',
    type: 'scroll',
    effectValue: 0,
    description: 'An enchanted parchment that safely teleports the hero back to Novice Town.',
    price: 50,
    stackMax: 99,
    usableInCombat: false,
    usableOnOverworld: true
  },
  item_beast_fang: {
    id: 'item_beast_fang',
    name: 'Beast Fang (เขี้ยวสัตว์อสูร)',
    type: 'loot',
    effectValue: 0,
    description: 'A sharp predator fang dropped by beasts. Sells for a good price to merchants.',
    price: 30,
    sellPrice: 20,
    stackMax: 99,
    usableInCombat: false,
    usableOnOverworld: false
  },
  item_boar_leather: {
    id: 'item_boar_leather',
    name: 'Boar Leather (หนังหมูป่า)',
    type: 'loot',
    effectValue: 0,
    description: 'Tough, coarse hide from wild boars prized by crafters and merchants.',
    price: 40,
    sellPrice: 30,
    stackMax: 99,
    usableInCombat: false,
    usableOnOverworld: false
  },
  item_serpent_scale: {
    id: 'item_serpent_scale',
    name: 'Serpent Scale (เกล็ดอสรพิษ)',
    type: 'loot',
    effectValue: 0,
    description: 'Shimmering reptilian scale collected from deep subterranean serpents.',
    price: 50,
    sellPrice: 40,
    stackMax: 99,
    usableInCombat: false,
    usableOnOverworld: false
  },
  item_bamboo_shoot: {
    id: 'item_bamboo_shoot',
    name: 'Bamboo Shoot (หน่อไม้สด)',
    type: 'loot',
    effectValue: 0,
    description: 'Crisp green shoot gathered from emerald bamboo groves.',
    price: 25,
    sellPrice: 15,
    stackMax: 99,
    usableInCombat: false,
    usableOnOverworld: false
  }
};

export function getItemDefinition(itemId: string): ItemDefinition | undefined {
  return ITEM_DATABASE[itemId];
}

export function getItemIcon(itemId: string): string {
  switch (itemId) {
    case 'item_small_herb': return '🌿';
    case 'item_ginseng': return '🌱';
    case 'item_steamed_bun': return '🥟';
    case 'item_herbal_tea': return '🍵';
    case 'item_vitality_pill': return '💊';
    case 'item_phoenix_feather': return '🪶';
    case 'item_town_scroll': return '📜';
    case 'item_beast_fang': return '🦷';
    case 'item_boar_leather': return '🐗';
    case 'item_serpent_scale': return '🐍';
    case 'item_bamboo_shoot': return '🎍';
    default: return '📦';
  }
}

