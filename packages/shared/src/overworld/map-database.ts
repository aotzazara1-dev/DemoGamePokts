import { MapConfig, Element } from '../types.js';

export const MAP_DATABASE: Record<string, MapConfig> = {
  novice_town_and_meadow: {
    id: 'novice_town_and_meadow',
    name: 'Novice Town & Whispering Meadow',
    theme: 'meadow',
    width: 50,
    height: 50,
    obstacles: [
      { x: 15, y: 15 },
      { x: 15, y: 16 },
      { x: 16, y: 15 }
    ],
    zones: [
      {
        id: 'novice_town',
        name: 'Novice Town',
        type: 'safe',
        bounds: { minX: 0, maxX: 20, minY: 0, maxY: 20 },
        encounterRatePerStep: 0,
        encounterPool: []
      },
      {
        id: 'whispering_meadow',
        name: 'Whispering Meadow',
        type: 'wild',
        bounds: { minX: 21, maxX: 49, minY: 0, maxY: 49 },
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
            element: Element.Earth,
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
        name: 'Exit to Whispering Meadow'
      }
    ]
  }
};

export const DEFAULT_OVERWORLD_MAP: MapConfig = MAP_DATABASE['novice_town_and_meadow'];

export function getMapConfig(mapId: string): MapConfig {
  return MAP_DATABASE[mapId] || DEFAULT_OVERWORLD_MAP;
}
