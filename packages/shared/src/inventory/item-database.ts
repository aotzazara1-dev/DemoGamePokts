import { ItemDefinition } from '../types.js';

export const ITEM_DATABASE: Record<string, ItemDefinition> = {
  item_small_herb: {
    id: 'item_small_herb',
    name: 'Ambrosia Dew (น้ำทิพย์อัมฤทธิ์)',
    type: 'hp_restore',
    effectValue: 50,
    description: 'A soothing vial of celestial ambrosia that restores 50 HP to a single ally.',
    price: 10,
    sellPrice: 5,
    stackMax: 99,
    usableInCombat: true,
    usableOnOverworld: true
  },
  item_ginseng: {
    id: 'item_ginseng',
    name: 'Soma Elixir (น้ำโสมะศักดิ์สิทธิ์)',
    type: 'sp_restore',
    effectValue: 40,
    description: 'A prized celestial elixir of the gods that restores 40 SP to a single ally.',
    price: 25,
    sellPrice: 12,
    stackMax: 99,
    usableInCombat: true,
    usableOnOverworld: true
  },
  item_steamed_bun: {
    id: 'item_steamed_bun',
    name: 'Golden Apple of Eden (แอปเปิ้ลทองคำแห่งอีเดน)',
    type: 'hp_restore',
    effectValue: 80,
    description: 'A sacred golden fruit plucked from the Garden of Eden that restores 80 HP to a single ally.',
    price: 20,
    stackMax: 99,
    usableInCombat: true,
    usableOnOverworld: true
  },
  item_herbal_tea: {
    id: 'item_herbal_tea',
    name: 'Nectar of the Gods (น้ำอมฤตแห่งทวยเทพ)',
    type: 'sp_restore',
    effectValue: 50,
    description: 'Refreshing divine nectar brewed in Valhalla that restores 50 SP to a single ally.',
    price: 30,
    stackMax: 99,
    usableInCombat: true,
    usableOnOverworld: true
  },
  item_vitality_pill: {
    id: 'item_vitality_pill',
    name: 'Valkyrie Balm (ยารักษาแห่งวาลคิรี)',
    type: 'hp_restore',
    effectValue: 200,
    description: 'A potent miraculous salve infused with Valkyrie healing essence restoring 200 HP to a single ally.',
    price: 80,
    stackMax: 99,
    usableInCombat: true,
    usableOnOverworld: true
  },
  item_phoenix_feather: {
    id: 'item_phoenix_feather',
    name: 'Völundr Feather (ขนนกฟื้นวิญญาณโวลุนเดอร์)',
    type: 'revive',
    effectValue: 100,
    description: 'A glowing Valkyrie soul feather that revives a fallen ally with 100 HP.',
    price: 150,
    stackMax: 20,
    usableInCombat: true,
    usableOnOverworld: true
  },
  item_town_scroll: {
    id: 'item_town_scroll',
    name: 'Bifrost Scroll (ม้วนคัมภีร์ไบฟรอสต์)',
    type: 'scroll',
    effectValue: 0,
    description: 'An enchanted celestial parchment that channels the Bifrost to teleport the hero back to Valhalla Coliseum.',
    price: 50,
    stackMax: 99,
    usableInCombat: false,
    usableOnOverworld: true
  },
  item_beast_fang: {
    id: 'item_beast_fang',
    name: 'Dragon Tooth (เขี้ยวมังกรสวรรค์)',
    type: 'loot',
    effectValue: 0,
    description: 'A sharp sacred dragon tooth dropped by mythical beasts. Sells for a good price to celestial merchants.',
    price: 30,
    sellPrice: 20,
    stackMax: 99,
    usableInCombat: false,
    usableOnOverworld: false
  },
  item_boar_leather: {
    id: 'item_boar_leather',
    name: 'Nemean Hide (หนังราชสีห์นีเมียน)',
    type: 'loot',
    effectValue: 0,
    description: 'Impervious, golden pelt from mythological beasts prized by celestial crafters.',
    price: 40,
    sellPrice: 30,
    stackMax: 99,
    usableInCombat: false,
    usableOnOverworld: false
  },
  item_serpent_scale: {
    id: 'item_serpent_scale',
    name: 'Jörmungandr Scale (เกล็ดพญางูยอร์มุนกันด์)',
    type: 'loot',
    effectValue: 0,
    description: 'Shimmering abyssal scale collected from the deep mythical serpent of Helheim.',
    price: 50,
    sellPrice: 40,
    stackMax: 99,
    usableInCombat: false,
    usableOnOverworld: false
  },
  item_bamboo_shoot: {
    id: 'item_bamboo_shoot',
    name: 'Yggdrasil Branch (กิ่งไม้โลกอิกดราซิล)',
    type: 'loot',
    effectValue: 0,
    description: 'A sacred radiant branch gathered from the World Tree in the Asgard Sanctuary.',
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
    case 'item_small_herb': return '🏺';
    case 'item_ginseng': return '🧪';
    case 'item_steamed_bun': return '🍎';
    case 'item_herbal_tea': return '🍵';
    case 'item_vitality_pill': return '💊';
    case 'item_phoenix_feather': return '🪶';
    case 'item_town_scroll': return '📜';
    case 'item_beast_fang': return '🦷';
    case 'item_boar_leather': return '🦁';
    case 'item_serpent_scale': return '🐉';
    case 'item_bamboo_shoot': return '🌿';
    default: return '📦';
  }
}
