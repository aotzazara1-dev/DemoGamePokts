import {
  Element,
  type ElementalSkillTreeConfig,
  type SkillTreeNode,
} from "../types.js";

/**
 * 2-Branch Elemental Skill Tree Configurations for the Hero (ADR 0008).
 * Strictly under 400 lines (Anti-God-Files ADR 0020).
 */
export const ELEMENTAL_SKILL_TREES: Record<Element, ElementalSkillTreeConfig> =
  {
    [Element.Earth]: {
      element: Element.Earth,
      branchAName: "ศิลาพิทักษ์ (Sentinel Ward)",
      branchBName: "ธรณีทำลายล้าง (Cataclysmic Shatter)",
      nodes: [
        // Branch A: Defense & Recovery
        {
          skillId: "skill_earth_shield",
          branch: "branch_a",
          tier: 1,
          requiredLevel: 1,
          skillPointCost: 1,
        },
        {
          skillId: "skill_stone_wall",
          branch: "branch_a",
          tier: 2,
          requiredLevel: 10,
          requiredSkillId: "skill_earth_shield",
          skillPointCost: 1,
        },
        {
          skillId: "skill_clay_regeneration",
          branch: "branch_a",
          tier: 3,
          requiredLevel: 20,
          requiredSkillId: "skill_stone_wall",
          skillPointCost: 1,
        },
        // Branch B: Crushing Earth Attacks
        {
          skillId: "rock_throw",
          branch: "branch_b",
          tier: 1,
          requiredLevel: 1,
          skillPointCost: 1,
        },
        {
          skillId: "skill_quakestrike",
          branch: "branch_b",
          tier: 2,
          requiredLevel: 10,
          requiredSkillId: "rock_throw",
          skillPointCost: 1,
        },
        {
          skillId: "skill_earth_splitter",
          branch: "branch_b",
          tier: 3,
          requiredLevel: 20,
          requiredSkillId: "skill_quakestrike",
          skillPointCost: 1,
        },
        // Capstone Ultimate
        {
          skillId: "skill_ultimate_gaia_wrath",
          tier: 4,
          requiredLevel: 30,
          skillPointCost: 1,
          isUltimate: true,
        },
      ],
    },

    [Element.Water]: {
      element: Element.Water,
      branchAName: "ธารน้ำทิพย์ (Sacred Spring Recovery)",
      branchBName: "เหมันต์เยือกแข็ง (Glacial Frost & Torrent)",
      nodes: [
        // Branch A: Healing & Revival
        {
          skillId: "skill_healing_spring",
          branch: "branch_a",
          tier: 1,
          requiredLevel: 1,
          skillPointCost: 1,
        },
        {
          skillId: "skill_purifying_wave",
          branch: "branch_a",
          tier: 2,
          requiredLevel: 10,
          requiredSkillId: "skill_healing_spring",
          skillPointCost: 1,
        },
        {
          skillId: "skill_ocean_revival",
          branch: "branch_a",
          tier: 3,
          requiredLevel: 20,
          requiredSkillId: "skill_purifying_wave",
          skillPointCost: 1,
        },
        // Branch B: Cryo Piercing Attacks
        {
          skillId: "aqua_jet",
          branch: "branch_b",
          tier: 1,
          requiredLevel: 1,
          skillPointCost: 1,
        },
        {
          skillId: "skill_frost_breath",
          branch: "branch_b",
          tier: 2,
          requiredLevel: 10,
          requiredSkillId: "aqua_jet",
          skillPointCost: 1,
        },
        {
          skillId: "skill_glacial_spike",
          branch: "branch_b",
          tier: 3,
          requiredLevel: 20,
          requiredSkillId: "skill_frost_breath",
          skillPointCost: 1,
        },
        // Capstone Ultimate
        {
          skillId: "skill_ultimate_poseidon_deluge",
          tier: 4,
          requiredLevel: 30,
          skillPointCost: 1,
          isUltimate: true,
        },
      ],
    },

    [Element.Fire]: {
      element: Element.Fire,
      branchAName: "คมดาบเพลิงกายภาพ (Blazing Blade & Might)",
      branchBName: "เพลิงเวทระเบิด (Pyroblast & Meteors)",
      nodes: [
        // Branch A: Physical Fire & Buffs
        {
          skillId: "flame_strike",
          branch: "branch_a",
          tier: 1,
          requiredLevel: 1,
          skillPointCost: 1,
        },
        {
          skillId: "skill_raging_flame",
          branch: "branch_a",
          tier: 2,
          requiredLevel: 10,
          requiredSkillId: "flame_strike",
          skillPointCost: 1,
        },
        {
          skillId: "skill_crimson_lotus",
          branch: "branch_a",
          tier: 3,
          requiredLevel: 20,
          requiredSkillId: "skill_raging_flame",
          skillPointCost: 1,
        },
        // Branch B: Explosive Magic & Breath
        {
          skillId: "skill_fireball",
          branch: "branch_b",
          tier: 1,
          requiredLevel: 1,
          skillPointCost: 1,
        },
        {
          skillId: "skill_inferno_blast",
          branch: "branch_b",
          tier: 2,
          requiredLevel: 10,
          requiredSkillId: "skill_fireball",
          skillPointCost: 1,
        },
        {
          skillId: "skill_dragon_breath",
          branch: "branch_b",
          tier: 3,
          requiredLevel: 20,
          requiredSkillId: "skill_inferno_blast",
          skillPointCost: 1,
        },
        // Capstone Ultimate
        {
          skillId: "skill_ultimate_surtr_conflagration",
          tier: 4,
          requiredLevel: 30,
          skillPointCost: 1,
          isUltimate: true,
        },
      ],
    },

    [Element.Wind]: {
      element: Element.Wind,
      branchAName: "วายุเร่งความเร็ว (Zephyr Speed & Evasion)",
      branchBName: "พายุกวาดล้าง (Aero Slices & Vortex)",
      nodes: [
        // Branch A: Speed & Evasion
        {
          skillId: "skill_wind_haste",
          branch: "branch_a",
          tier: 1,
          requiredLevel: 1,
          skillPointCost: 1,
        },
        {
          skillId: "skill_shadow_evasion",
          branch: "branch_a",
          tier: 2,
          requiredLevel: 10,
          requiredSkillId: "skill_wind_haste",
          skillPointCost: 1,
        },
        {
          skillId: "skill_tempest_celerity",
          branch: "branch_a",
          tier: 3,
          requiredLevel: 20,
          requiredSkillId: "skill_shadow_evasion",
          skillPointCost: 1,
        },
        // Branch B: Slashing Wind Vortex
        {
          skillId: "gale_slash",
          branch: "branch_b",
          tier: 1,
          requiredLevel: 1,
          skillPointCost: 1,
        },
        {
          skillId: "skill_cyclone_barrage",
          branch: "branch_b",
          tier: 2,
          requiredLevel: 10,
          requiredSkillId: "gale_slash",
          skillPointCost: 1,
        },
        {
          skillId: "skill_sky_rending_strike",
          branch: "branch_b",
          tier: 3,
          requiredLevel: 20,
          requiredSkillId: "skill_cyclone_barrage",
          skillPointCost: 1,
        },
        // Capstone Ultimate
        {
          skillId: "skill_ultimate_odin_tempest",
          tier: 4,
          requiredLevel: 30,
          skillPointCost: 1,
          isUltimate: true,
        },
      ],
    },
  };

export function getElementalSkillTree(
  element: Element
): ElementalSkillTreeConfig {
  return ELEMENTAL_SKILL_TREES[element];
}

export function findSkillTreeNode(
  skillId: string
): { node: SkillTreeNode; config: ElementalSkillTreeConfig } | undefined {
  for (const config of Object.values(ELEMENTAL_SKILL_TREES)) {
    const found = config.nodes.find((n) => n.skillId === skillId);
    if (found) {
      return { node: found, config };
    }
  }
  return undefined;
}
