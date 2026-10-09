import { ItemDefinition } from '../types.js';

export const ITEM_DATABASE: Record<string, ItemDefinition> = {
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
  }
};

export function getItemDefinition(itemId: string): ItemDefinition | undefined {
  return ITEM_DATABASE[itemId];
}
