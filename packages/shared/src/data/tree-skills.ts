import { Element } from "../types.js";
import { type SkillDefinition } from "./skills.js";

/**
 * Advanced Elemental Skill Tree techniques for the Hero (ADR 0008).
 * Separated into a sub-catalog to honor ADR 0020 LOC limits.
 */
export const TREE_SKILLS: Record<string, SkillDefinition> = {
  // --- EARTH TREE SKILLS ---
  skill_stone_wall: {
    id: "skill_stone_wall",
    name: "Stone Rampart (กำแพงศิลา)",
    element: Element.Earth,
    spCost: 18,
    multiplier: 0,
    category: "buff",
    description:
      "Raises stone ramparts, boosting DEF by 50% for high survivability.",
  },
  skill_clay_regeneration: {
    id: "skill_clay_regeneration",
    name: "Earthen Vigor (พสุธาฟื้นชีพ)",
    element: Element.Earth,
    spCost: 20,
    multiplier: 0,
    category: "heal",
    description:
      "Draws vitality from the ancient soil to restore 220 HP to an ally.",
  },
  skill_earth_splitter: {
    id: "skill_earth_splitter",
    name: "Continent Splitter (หมัดผ่าปฐพี)",
    element: Element.Earth,
    spCost: 26,
    multiplier: 2.3,
    category: "attack",
    description:
      "Shatters continental plates under target with catastrophic force.",
  },
  skill_ultimate_gaia_wrath: {
    id: "skill_ultimate_gaia_wrath",
    name: "Wrath of Gaia (มหาพิโรธพระแม่ธรณี)",
    element: Element.Earth,
    spCost: 35,
    multiplier: 2.8,
    category: "attack",
    description:
      "Ultimate Earth invocation crushing all opposing formation beneath a tectonic cataclysm.",
  },

  // --- WATER TREE SKILLS ---
  skill_purifying_wave: {
    id: "skill_purifying_wave",
    name: "Cleansing Tide (คลื่นชำระล้าง)",
    element: Element.Water,
    spCost: 20,
    multiplier: 0,
    category: "heal",
    description: "Summons a sacred tide restoring 220 HP to an ally.",
  },
  skill_ocean_revival: {
    id: "skill_ocean_revival",
    name: "Nectar of Life (วารีชุบวิญญาณ)",
    element: Element.Water,
    spCost: 28,
    multiplier: 0,
    category: "heal",
    description:
      "Resurrects a fallen ally with pure nectar, returning them with 250 HP.",
  },
  skill_glacial_spike: {
    id: "skill_glacial_spike",
    name: "Absolute Zero Spike (หอกน้ำแข็งนิรันดร์)",
    element: Element.Water,
    spCost: 26,
    multiplier: 2.3,
    category: "attack",
    description:
      "Pierces enemy lines with a crystalline spear forged in freezing glacial abyss.",
  },
  skill_ultimate_poseidon_deluge: {
    id: "skill_ultimate_poseidon_deluge",
    name: "Leviathan Tsunami (มหาคลื่นกลืนสมุทร)",
    element: Element.Water,
    spCost: 35,
    multiplier: 2.8,
    category: "attack",
    description:
      "Ultimate Water invocation unleashing a world-swallowing tidal deluge.",
  },

  // --- FIRE TREE SKILLS ---
  skill_crimson_lotus: {
    id: "skill_crimson_lotus",
    name: "Crimson Lotus Slash (เพลงดาบดอกบัวชาด)",
    element: Element.Fire,
    spCost: 26,
    multiplier: 2.4,
    category: "attack",
    description:
      "Unleashes blooming fiery petal cuts that ravage enemy defense.",
  },
  skill_fireball: {
    id: "skill_fireball",
    name: "Fireball (บอลเพลิงกาฬ)",
    element: Element.Fire,
    spCost: 10,
    multiplier: 1.4,
    category: "attack",
    description: "Hurls a roaring fireball incinerating frontline enemies.",
  },
  skill_dragon_breath: {
    id: "skill_dragon_breath",
    name: "Hellfire Dragon Breath (ลมหายใจมังกรเพลิง)",
    element: Element.Fire,
    spCost: 28,
    multiplier: 2.4,
    category: "attack",
    description:
      "Breathes ancient dragon flames scorching the target formation.",
  },
  skill_ultimate_surtr_conflagration: {
    id: "skill_ultimate_surtr_conflagration",
    name: "Surtr's Calamity (เพลิงผลาญพิภพเซิร์ท)",
    element: Element.Fire,
    spCost: 36,
    multiplier: 2.9,
    category: "attack",
    description:
      "Ultimate Fire invocation summoning Surtr's sword to burn the world to ash.",
  },

  // --- WIND TREE SKILLS ---
  skill_shadow_evasion: {
    id: "skill_shadow_evasion",
    name: "Mirage Step (ย่างก้าวภาพลวงตา)",
    element: Element.Wind,
    spCost: 16,
    multiplier: 0,
    category: "buff",
    description:
      "Manipulates air currents to blur user image, raising AGI by 50%.",
  },
  skill_tempest_celerity: {
    id: "skill_tempest_celerity",
    name: "Tempest Flow (ปราณวายุไร้เงา)",
    element: Element.Wind,
    spCost: 22,
    multiplier: 0,
    category: "buff",
    description:
      "Accelerates reflex and strike flow to extreme heights, raising AGI by 60%.",
  },
  skill_sky_rending_strike: {
    id: "skill_sky_rending_strike",
    name: "Heaven's Cleaver (ดาบฟันนภา)",
    element: Element.Wind,
    spCost: 25,
    multiplier: 2.3,
    category: "attack",
    description:
      "Splits heaven and earth with a razor gale slash bypassing defenses.",
  },
  skill_ultimate_odin_tempest: {
    id: "skill_ultimate_odin_tempest",
    name: "Gungnir Windstorm (วายุสลาตันแห่งโอดิน)",
    element: Element.Wind,
    spCost: 34,
    multiplier: 2.8,
    category: "attack",
    description:
      "Ultimate Wind invocation calling down Odin's raging storm tempest.",
  },
};
