import { Element } from "../types.js";

export type SkillCategory = "attack" | "heal" | "buff" | "debuff";

export interface SkillDefinition {
  id: string;
  name: string;
  element: Element | "neutral";
  spCost: number;
  multiplier: number;
  category: SkillCategory;
  description: string;
  isSignature?: boolean;
}

export const SKILL_DATABASE: Record<string, SkillDefinition> = {
  // --- SIGNATURE SKILLS (ขุนพลซิกเนเจอร์) ---
  skill_sky_piercer: {
    id: "skill_sky_piercer",
    name: "Sky Piercer Strike (ทวนกรีดนภาไร้พ่าย)",
    element: Element.Fire,
    spCost: 24,
    multiplier: 2.2,
    category: "attack",
    isSignature: true,
    description:
      "Lu Bu's peerless halberd thrust that splits the clouds and shatters armor.",
  },
  skill_god_of_war_rage: {
    id: "skill_god_of_war_rage",
    name: "God of War Fury (ปราณสงครามคลั่ง)",
    element: Element.Fire,
    spCost: 16,
    multiplier: 1.6,
    category: "attack",
    isSignature: true,
    description: "Scorching battle cry igniting fiery halberd slashes.",
  },
  skill_tsubame_gaeshi: {
    id: "skill_tsubame_gaeshi",
    name: "Tsubame Gaeshi (นางแอ่นหวนกลับ)",
    element: Element.Water,
    spCost: 20,
    multiplier: 2.1,
    category: "attack",
    isSignature: true,
    description:
      "Sasaki Kojiro's legendary multi-angle flowing sword reversal.",
  },
  skill_thousand_images: {
    id: "skill_thousand_images",
    name: "Thousand Images Slash (ดาบหมื่นจินตภาพ)",
    element: Element.Water,
    spCost: 15,
    multiplier: 1.5,
    category: "attack",
    isSignature: true,
    description:
      "Deep flow meditation predicting and deflecting enemy strikes.",
  },
  skill_eyes_of_the_lord: {
    id: "skill_eyes_of_the_lord",
    name: "Eyes of the Lord (เนตรเทวะเลียนแบบ)",
    element: Element.Earth,
    spCost: 20,
    multiplier: 2.0,
    category: "attack",
    isSignature: true,
    description:
      "Adam's divine ocular technique mirroring and countering any strike.",
  },
  skill_father_strike: {
    id: "skill_father_strike",
    name: "Father's Resolve (หมัดปกป้องบุตร)",
    element: Element.Earth,
    spCost: 14,
    multiplier: 1.5,
    category: "attack",
    isSignature: true,
    description: "An unyielding fist imbued with primal earth vigor.",
  },
  skill_geirrod_hammer: {
    id: "skill_geirrod_hammer",
    name: "Geirröd Awakened Hammer (กีย์ร็อดค้อนทุบโลก)",
    element: Element.Wind,
    spCost: 25,
    multiplier: 2.3,
    category: "attack",
    isSignature: true,
    description:
      "Thor's awakened Mjölnir swing unleashing catastrophic gale pressure.",
  },
  skill_thunder_clap: {
    id: "skill_thunder_clap",
    name: "Roaring Thunderclap (วายุอัสนีบาต)",
    element: Element.Wind,
    spCost: 15,
    multiplier: 1.5,
    category: "attack",
    isSignature: true,
    description:
      "Storm burst that disorients and tears through target defense.",
  },

  // --- HERO SIGNATURE SKILLS ---
  skill_hero_earth_breaker: {
    id: "skill_hero_earth_breaker",
    name: "Terra Breaker (ผ่าพิภพสะเทือน)",
    element: Element.Earth,
    spCost: 18,
    multiplier: 1.8,
    category: "attack",
    isSignature: true,
    description:
      "Hero's awakened elemental earth slash rupturing ground beneath target.",
  },
  skill_hero_ocean_tide: {
    id: "skill_hero_ocean_tide",
    name: "Tidal Surge (คลื่นวารีถั่งโถม)",
    element: Element.Water,
    spCost: 18,
    multiplier: 1.8,
    category: "attack",
    isSignature: true,
    description: "Hero's divine water strike piercing enemy formation.",
  },
  skill_hero_blazing_slash: {
    id: "skill_hero_blazing_slash",
    name: "Flame Burst (ระเบิดเพลิงผลาญ)",
    element: Element.Fire,
    spCost: 18,
    multiplier: 1.8,
    category: "attack",
    isSignature: true,
    description: "Hero's raging fire slash enveloping the target in flames.",
  },
  skill_hero_storm_surge: {
    id: "skill_hero_storm_surge",
    name: "Gale Fang (เขี้ยววายุทมิฬ)",
    element: Element.Wind,
    spCost: 18,
    multiplier: 1.8,
    category: "attack",
    isSignature: true,
    description: "Hero's swift wind strike that bypasses enemy guard.",
  },

  // --- LEARNABLE COMMON & ADVANCED SKILLS (จาก Skill Tomes) ---
  rock_throw: {
    id: "rock_throw",
    name: "Rock Throw (หินทับศัตรู)",
    element: Element.Earth,
    spCost: 10,
    multiplier: 1.4,
    category: "attack",
    description: "Hurls massive bedrock boulders crushing frontline enemies.",
  },
  skill_earth_shield: {
    id: "skill_earth_shield",
    name: "Terra Ward (เกราะปราณศิลา)",
    element: Element.Earth,
    spCost: 12,
    multiplier: 0,
    category: "buff",
    description: "Fortifies the body with earthen stone, raising DEF by 35%.",
  },
  skill_quakestrike: {
    id: "skill_quakestrike",
    name: "Cataclysm Tremor (ธรณีพิโรธ)",
    element: Element.Earth,
    spCost: 22,
    multiplier: 1.9,
    category: "attack",
    description: "Violent earthquake fissure crushing the target line.",
  },

  aqua_jet: {
    id: "aqua_jet",
    name: "Aqua Jet (กระแสน้ำเชี่ยวกราก)",
    element: Element.Water,
    spCost: 10,
    multiplier: 1.4,
    category: "attack",
    description: "High-pressure water torrent piercing enemy defenses.",
  },
  skill_healing_spring: {
    id: "skill_healing_spring",
    name: "Healing Spring (ธารน้ำทิพย์ฟื้นกาย)",
    element: Element.Water,
    spCost: 14,
    multiplier: 0,
    category: "heal",
    description: "Channels sacred spring waters to restore 150 HP to an ally.",
  },
  skill_frost_breath: {
    id: "skill_frost_breath",
    name: "Niflheim Blizzard (หิมะเหมันต์เยือกแข็ง)",
    element: Element.Water,
    spCost: 22,
    multiplier: 1.9,
    category: "attack",
    description: "Sub-zero frost wave freezing enemy lifeforce.",
  },

  flame_strike: {
    id: "flame_strike",
    name: "Flame Strike (คมดาบเพลิงโลกันตร์)",
    element: Element.Fire,
    spCost: 12,
    multiplier: 1.5,
    category: "attack",
    description: "Scorching fiery slash igniting targets.",
  },
  skill_raging_flame: {
    id: "skill_raging_flame",
    name: "Blazing Might (มนตร์เพลิงปลุกพลัง)",
    element: Element.Fire,
    spCost: 14,
    multiplier: 0,
    category: "buff",
    description: "Ignites inner fighting spirit, boosting ATK by 30%.",
  },
  skill_inferno_blast: {
    id: "skill_inferno_blast",
    name: "Muspelheim Meteor (อุกกาบาตเพลิงบรรลัยกัลป์)",
    element: Element.Fire,
    spCost: 24,
    multiplier: 2.1,
    category: "attack",
    description: "Summons descending volcanic meteors incinerating the target.",
  },

  gale_slash: {
    id: "gale_slash",
    name: "Gale Slash (ดาบวายุเชือดเฉือน)",
    element: Element.Wind,
    spCost: 8,
    multiplier: 1.3,
    category: "attack",
    description: "Razor wind blades cutting through opposing formation.",
  },
  skill_wind_haste: {
    id: "skill_wind_haste",
    name: "Zephyr Swiftness (มนตร์วายุเร่งความเร็ว)",
    element: Element.Wind,
    spCost: 10,
    multiplier: 0,
    category: "buff",
    description: "Rides swift tailwinds, boosting AGI by 35%.",
  },
  skill_cyclone_barrage: {
    id: "skill_cyclone_barrage",
    name: "Tornado Vortex (พายุหมุนกวาดล้าง)",
    element: Element.Wind,
    spCost: 20,
    multiplier: 1.8,
    category: "attack",
    description: "Engulfs target in a shrieking whirlwind slicing repeatedly.",
  },

  // --- NEUTRAL SKILLS (เรียนได้ทุกธาตุ) ---
  skill_power_strike: {
    id: "skill_power_strike",
    name: "Power Strike (จู่โจมเต็มกำลัง)",
    element: "neutral",
    spCost: 8,
    multiplier: 1.5,
    category: "attack",
    description: "Heavy concentrated physical blow usable by any warrior.",
  },
  skill_inner_focus: {
    id: "skill_inner_focus",
    name: "Inner Focus (รวบรวมสมาธิ)",
    element: "neutral",
    spCost: 0,
    multiplier: 0,
    category: "buff",
    description: "Takes a breath to regain 25 SP.",
  },
};

// Backward-compatibility alias
export const ELEMENTAL_SKILLS = SKILL_DATABASE;

export function getSkillDefinition(id: string): SkillDefinition | undefined {
  return SKILL_DATABASE[id];
}
