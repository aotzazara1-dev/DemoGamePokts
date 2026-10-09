import { MapConfig, Element } from '../types.js';

export const MAP_DATABASE: Record<string, MapConfig> = {
  novice_town_and_meadow: {
    id: 'novice_town_and_meadow',
    name: 'Novice Town & Whispering Meadow',
    theme: 'meadow',
    width: 50,
    height: 50,
    obstacles: [
      { x: 8, y: 10 },
      { x: 12, y: 8 },
      { x: 15, y: 15 },
      { x: 15, y: 16 },
      { x: 16, y: 15 }
    ],
    zones: [
      {
        id: 'novice_town',
        name: 'Novice Town',
        type: 'safe',
        bounds: { minX: 0, maxX: 15, minY: 0, maxY: 20 },
        encounterRatePerStep: 0,
        encounterPool: []
      },
      {
        id: 'whispering_meadow',
        name: 'Whispering Meadow',
        type: 'wild',
        bounds: { minX: 16, maxX: 49, minY: 0, maxY: 49 },
        encounterRatePerStep: 0.15,
        encounterPool: [
          {
            beastTemplateId: 'leaf_sprite',
            name: 'Leaf Sprite',
            element: Element.Wind,
            baseLevel: 3,
            levelVariance: 1,
            weight: 1,
            baseHp: 35,
            baseSp: 15,
            baseAtk: 12,
            baseDef: 8,
            baseAgi: 14
          },
          {
            beastTemplateId: 'rock_boar',
            name: 'Rock Boar',
            element: Element.Earth,
            baseLevel: 4,
            levelVariance: 1,
            weight: 1,
            baseHp: 50,
            baseSp: 10,
            baseAtk: 16,
            baseDef: 14,
            baseAgi: 8
          }
        ]
      }
    ],
    portals: [
      {
        id: 'portal_meadow_to_cave',
        position: { x: 35, y: 2 },
        targetMapId: 'pebble_cave',
        targetPosition: { x: 2, y: 15 },
        name: 'Entrance to Pebble Cave'
      },
      {
        id: 'portal_meadow_to_forest',
        position: { x: 48, y: 25 },
        targetMapId: 'bamboo_forest',
        targetPosition: { x: 2, y: 25 },
        name: 'Pathway to Bamboo Forest'
      }
    ],
    npcs: [
      {
        id: 'npc_merchant_qian',
        name: 'พ่อค้าเฉียน (Merchant Qian)',
        title: 'พ่อค้าของชำประจำหมู่บ้าน',
        avatarIcon: '🏪',
        spriteKey: 'npc_merchant',
        position: { x: 8, y: 10 },
        greeting: 'ยินดีต้อนรับจอมยุทธ์น้อย! ร้านข้ามีเสบียง ซาลาเปา ยาฟื้นพลัง และคัมภีร์วาร์ปพร้อมสรรพ ต้องการสิ่งใดหรือไม่?',
        options: [
          { id: 'opt_shop', label: '🛒 ซื้อขายสินค้า (Open Shop)', action: 'shop' },
          { id: 'opt_close', label: '✕ ลาก่อน (Goodbye)', action: 'close' }
        ],
        shopItemIds: [
          'item_small_herb',
          'item_ginseng',
          'item_steamed_bun',
          'item_herbal_tea',
          'item_vitality_pill',
          'item_phoenix_feather',
          'item_town_scroll'
        ]
      },
      {
        id: 'npc_elder_zhang',
        name: 'ผู้เฒ่าจาง (Elder Zhang)',
        title: 'ผู้อาวุโสแห่งหมู่บ้านเริ่มต้น',
        avatarIcon: '👴',
        spriteKey: 'npc_elder',
        position: { x: 12, y: 8 },
        greeting: 'ขอคารวะจอมยุทธ์! การเดินทางฝึกฝนในยุทธภพเต็มไปด้วยภยันตราย หากเหน็ดเหนื่อยเมื่อใด ให้ข้าช่วยรักษาบาดแผลและฟื้นฟูกำลังภายในให้เถิด',
        options: [
          {
            id: 'opt_heal',
            label: '💖 ฟื้นฟูกำลังทั้งหมด (Full Heal - ฟรี)',
            action: 'heal',
            response: 'ผู้เฒ่าจางได้ใช้วิชาลมปราณบำบัด ฟื้นฟูพลังชีวิตและจิตวิญญาณของทุกคนในปาร์ตี้จนเต็มเปี่ยม!'
          },
          {
            id: 'opt_advice',
            label: '📜 รับฟังคำแนะนำการผจญภัย (Advice)',
            action: 'advice',
            response: 'ทิศตะวันออกมีทุ่งหญ้า Whispering Meadow มีสัตว์อสูรธาตุลมและดิน หากเดินลึกขึ้นไปทิศเหนือจะพบถ้ำกรวด Pebble Cave และทิศตะวันออกไกลคือป่าไผ่ Bamboo Forest!'
          },
          { id: 'opt_close', label: '✕ ลาก่อน (Goodbye)', action: 'close' }
        ]
      }
    ]
  },

  pebble_cave: {
    id: 'pebble_cave',
    name: 'Pebble Cave',
    theme: 'cave',
    width: 30,
    height: 30,
    obstacles: [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 20, y: 15 },
      { x: 20, y: 16 }
    ],
    zones: [
      {
        id: 'pebble_depths',
        name: 'Pebble Cave Depths',
        type: 'wild',
        bounds: { minX: 0, maxX: 29, minY: 0, maxY: 29 },
        encounterRatePerStep: 0.16,
        encounterPool: [
          {
            beastTemplateId: 'iron_beetle',
            name: 'Iron Beetle',
            element: Element.Earth,
            baseLevel: 6,
            levelVariance: 1,
            weight: 1,
            baseHp: 65,
            baseSp: 15,
            baseAtk: 18,
            baseDef: 22,
            baseAgi: 10
          },
          {
            beastTemplateId: 'cave_serpent',
            name: 'Cave Serpent',
            element: Element.Water,
            baseLevel: 7,
            levelVariance: 1,
            weight: 1,
            baseHp: 55,
            baseSp: 25,
            baseAtk: 22,
            baseDef: 12,
            baseAgi: 18
          }
        ]
      }
    ],
    portals: [
      {
        id: 'portal_cave_to_meadow',
        position: { x: 1, y: 15 },
        targetMapId: 'novice_town_and_meadow',
        targetPosition: { x: 35, y: 3 },
        name: 'Exit to Whispering Meadow'
      }
    ]
  },

  bamboo_forest: {
    id: 'bamboo_forest',
    name: 'Bamboo Forest',
    theme: 'forest',
    width: 40,
    height: 40,
    obstacles: [
      { x: 12, y: 12 },
      { x: 13, y: 12 },
      { x: 25, y: 20 },
      { x: 26, y: 20 }
    ],
    zones: [
      {
        id: 'emerald_bamboo',
        name: 'Emerald Bamboo Grove',
        type: 'wild',
        bounds: { minX: 0, maxX: 39, minY: 0, maxY: 39 },
        encounterRatePerStep: 0.18,
        encounterPool: [
          {
            beastTemplateId: 'bamboo_panda',
            name: 'Bamboo Panda',
            element: Element.Wind,
            baseLevel: 8,
            levelVariance: 1,
            weight: 1,
            baseHp: 90,
            baseSp: 20,
            baseAtk: 26,
            baseDef: 18,
            baseAgi: 12
          },
          {
            beastTemplateId: 'crimson_fox',
            name: 'Crimson Fox',
            element: Element.Fire,
            baseLevel: 9,
            levelVariance: 1,
            weight: 1,
            baseHp: 65,
            baseSp: 35,
            baseAtk: 28,
            baseDef: 14,
            baseAgi: 22
          }
        ]
      }
    ],
    portals: [
      {
        id: 'portal_forest_to_meadow',
        position: { x: 1, y: 25 },
        targetMapId: 'novice_town_and_meadow',
        targetPosition: { x: 47, y: 25 },
        name: 'Return to Whispering Meadow'
      }
    ]
  }
};

export const DEFAULT_OVERWORLD_MAP: MapConfig = MAP_DATABASE['novice_town_and_meadow'];

export function getMapConfig(mapId: string): MapConfig {
  return MAP_DATABASE[mapId] || DEFAULT_OVERWORLD_MAP;
}
