import { ItemDefinition } from "../types.js";

/**
 * Skill Tomes Catalog (คัมภีร์ตำราสกิล)
 * Consumable scroll items that teach skills to Hero or Active Champion,
 * functioning as learnable skill scrolls.
 */
export const SKILL_TOMES: Record<string, ItemDefinition> = {
  // --- EARTH TOMES ---
  item_tome_rock_throw: {
    id: "item_tome_rock_throw",
    name: "Tome: Rock Throw (ตำราหินทับศัตรู)",
    type: "scroll",
    category: "consumable",
    effectValue: 0,
    skillId: "rock_throw",
    description:
      "Ancient stone tablet inscribed with earth manipulation techniques. Teaches Rock Throw.",
    price: 150,
    sellPrice: 75,
    stackMax: 20,
    usableInCombat: false,
    usableOnOverworld: true,
  },
  item_tome_earth_shield: {
    id: "item_tome_earth_shield",
    name: "Tome: Terra Ward (ตำราเกราะปราณศิลา)",
    type: "scroll",
    category: "consumable",
    effectValue: 0,
    skillId: "skill_earth_shield",
    description:
      "Defensive manuscript revealing the secrets of earthen armor. Teaches Terra Ward.",
    price: 250,
    sellPrice: 125,
    stackMax: 20,
    usableInCombat: false,
    usableOnOverworld: true,
  },
  item_tome_quakestrike: {
    id: "item_tome_quakestrike",
    name: "Tome: Cataclysm Tremor (ตำราธรณีพิโรธ)",
    type: "scroll",
    category: "consumable",
    effectValue: 0,
    skillId: "skill_quakestrike",
    description:
      "Forbidden scroll containing seismic catastrophe incantations. Teaches Cataclysm Tremor.",
    price: 350,
    sellPrice: 175,
    stackMax: 20,
    usableInCombat: false,
    usableOnOverworld: true,
  },

  // --- WATER TOMES ---
  item_tome_aqua_jet: {
    id: "item_tome_aqua_jet",
    name: "Tome: Aqua Jet (ตำรากระแสน้ำเชี่ยวกราก)",
    type: "scroll",
    category: "consumable",
    effectValue: 0,
    skillId: "aqua_jet",
    description:
      "Flowing silk scroll detailing rapid aquatic piercing forms. Teaches Aqua Jet.",
    price: 150,
    sellPrice: 75,
    stackMax: 20,
    usableInCombat: false,
    usableOnOverworld: true,
  },
  item_tome_healing_spring: {
    id: "item_tome_healing_spring",
    name: "Tome: Healing Spring (ตำราธารน้ำทิพย์ฟื้นกาย)",
    type: "scroll",
    category: "consumable",
    effectValue: 0,
    skillId: "skill_healing_spring",
    description:
      "Medical compendium on restorative sacred waters. Teaches Healing Spring.",
    price: 280,
    sellPrice: 140,
    stackMax: 20,
    usableInCombat: false,
    usableOnOverworld: true,
  },
  item_tome_frost_breath: {
    id: "item_tome_frost_breath",
    name: "Tome: Niflheim Blizzard (ตำราหิมะเหมันต์เยือกแข็ง)",
    type: "scroll",
    category: "consumable",
    effectValue: 0,
    skillId: "skill_frost_breath",
    description:
      "Glacial parchment emitting sub-zero frost mist. Teaches Niflheim Blizzard.",
    price: 350,
    sellPrice: 175,
    stackMax: 20,
    usableInCombat: false,
    usableOnOverworld: true,
  },

  // --- FIRE TOMES ---
  item_tome_flame_strike: {
    id: "item_tome_flame_strike",
    name: "Tome: Flame Strike (ตำราคมดาบเพลิงโลกันตร์)",
    type: "scroll",
    category: "consumable",
    effectValue: 0,
    skillId: "flame_strike",
    description:
      "Charred martial manual infused with smoldering embers. Teaches Flame Strike.",
    price: 150,
    sellPrice: 75,
    stackMax: 20,
    usableInCombat: false,
    usableOnOverworld: true,
  },
  item_tome_raging_flame: {
    id: "item_tome_raging_flame",
    name: "Tome: Blazing Might (ตำรามนตร์เพลิงปลุกพลัง)",
    type: "scroll",
    category: "consumable",
    effectValue: 0,
    skillId: "skill_raging_flame",
    description:
      "War doctrine on awakening inner pyroclastic battle aura. Teaches Blazing Might.",
    price: 250,
    sellPrice: 125,
    stackMax: 20,
    usableInCombat: false,
    usableOnOverworld: true,
  },
  item_tome_inferno_blast: {
    id: "item_tome_inferno_blast",
    name: "Tome: Muspelheim Meteor (ตำราอุกกาบาตเพลิงบรรลัยกัลป์)",
    type: "scroll",
    category: "consumable",
    effectValue: 0,
    skillId: "skill_inferno_blast",
    description:
      "Volcanic scripture summoning descending fiery cataclysm. Teaches Muspelheim Meteor.",
    price: 350,
    sellPrice: 175,
    stackMax: 20,
    usableInCombat: false,
    usableOnOverworld: true,
  },

  // --- WIND TOMES ---
  item_tome_gale_slash: {
    id: "item_tome_gale_slash",
    name: "Tome: Gale Slash (ตำราดาบวายุเชือดเฉือน)",
    type: "scroll",
    category: "consumable",
    effectValue: 0,
    skillId: "gale_slash",
    description:
      "Lightweight aeromantic manual detailing swift sonic slashes. Teaches Gale Slash.",
    price: 150,
    sellPrice: 75,
    stackMax: 20,
    usableInCombat: false,
    usableOnOverworld: true,
  },
  item_tome_wind_haste: {
    id: "item_tome_wind_haste",
    name: "Tome: Zephyr Swiftness (ตำรามนตร์วายุเร่งความเร็ว)",
    type: "scroll",
    category: "consumable",
    effectValue: 0,
    skillId: "skill_wind_haste",
    description:
      "Feathered parchment explaining tailwind acceleration strides. Teaches Zephyr Swiftness.",
    price: 250,
    sellPrice: 125,
    stackMax: 20,
    usableInCombat: false,
    usableOnOverworld: true,
  },
  item_tome_cyclone_barrage: {
    id: "item_tome_cyclone_barrage",
    name: "Tome: Tornado Vortex (ตำราพายุหมุนกวาดล้าง)",
    type: "scroll",
    category: "consumable",
    effectValue: 0,
    skillId: "skill_cyclone_barrage",
    description:
      "Tempest grimoire commanding relentless howling cyclones. Teaches Tornado Vortex.",
    price: 350,
    sellPrice: 175,
    stackMax: 20,
    usableInCombat: false,
    usableOnOverworld: true,
  },

  // --- NEUTRAL TOMES ---
  item_tome_power_strike: {
    id: "item_tome_power_strike",
    name: "Tome: Power Strike (ตำราจู่โจมเต็มกำลัง)",
    type: "scroll",
    category: "consumable",
    effectValue: 0,
    skillId: "skill_power_strike",
    description:
      "Universal warrior treatise on heavy physical focus. Teaches Power Strike to any element.",
    price: 150,
    sellPrice: 75,
    stackMax: 20,
    usableInCombat: false,
    usableOnOverworld: true,
  },
  item_tome_inner_focus: {
    id: "item_tome_inner_focus",
    name: "Tome: Inner Focus (ตำรารวบรวมสมาธิ)",
    type: "scroll",
    category: "consumable",
    effectValue: 0,
    skillId: "skill_inner_focus",
    description:
      "Zen meditation primer cultivating boundless spirit and SP restoration.",
    price: 200,
    sellPrice: 100,
    stackMax: 20,
    usableInCombat: false,
    usableOnOverworld: true,
  },
};
