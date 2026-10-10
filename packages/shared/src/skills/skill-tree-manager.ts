import {
  type Combatant,
  type CombatantSkillSlot,
  type SkillTreeBranchId,
} from "../types.js";
import {
  findSkillTreeNode,
  getElementalSkillTree,
} from "../data/skill-trees.js";
import { getSkillDefinition } from "../data/skills.js";
import { SkillManager } from "./skill-manager.js";

export interface SkillUnlockResult {
  success: boolean;
  hero: Combatant;
  reason?: string;
  autoEquippedSlot?: number;
}

export interface SkillSlotResult {
  success: boolean;
  hero: Combatant;
  reason?: string;
}

/**
 * Domain manager for Hero Elemental Skill Tree progression and slot equipment (ADR 0008, ADR 0021).
 * Strictly <= 400 lines (Anti-God-Files ADR 0020).
 */
export class SkillTreeManager {
  /**
   * Guarantees hero has valid skillSlots, skillPoints, and unlockedSkillIds.
   */
  public static ensureHeroSkillTreeState(hero: Combatant): Combatant {
    SkillManager.ensureSkillSlots(hero);
    return {
      ...hero,
      skillPoints: hero.skillPoints ?? 0,
      unlockedSkillIds: hero.unlockedSkillIds ? [...hero.unlockedSkillIds] : [],
    };
  }

  /**
   * Validates whether a Hero fulfills all prerequisites to unlock a tree skill.
   */
  public static canUnlockSkill(
    hero: Combatant,
    skillId: string
  ): { canUnlock: boolean; reason?: string } {
    if (!hero.isHero) {
      return {
        canUnlock: false,
        reason: "Only Heroes can unlock Elemental Skill Tree abilities.",
      };
    }

    const nodeInfo = findSkillTreeNode(skillId);
    if (!nodeInfo) {
      return {
        canUnlock: false,
        reason: `Skill '${skillId}' is not found in any Elemental Skill Tree.`,
      };
    }

    const { node, config } = nodeInfo;

    // 1. Element Affinity check
    if (config.element !== hero.element) {
      return {
        canUnlock: false,
        reason: `Skill element (${config.element}) does not match Hero element (${hero.element}).`,
      };
    }

    // 2. Already unlocked check
    const unlockedIds = hero.unlockedSkillIds ?? [];
    if (unlockedIds.includes(skillId)) {
      return { canUnlock: false, reason: "Skill has already been learned." };
    }

    // 3. Level Requirement check
    if (hero.level < node.requiredLevel) {
      return {
        canUnlock: false,
        reason: `Requires Hero Level ${node.requiredLevel} (Current: ${hero.level}).`,
      };
    }

    // 4. Skill Points check
    const currentPoints = hero.skillPoints ?? 0;
    const cost = node.skillPointCost || 1;
    if (currentPoints < cost) {
      return {
        canUnlock: false,
        reason: `Requires ${cost} Skill Point(s) (Available: ${currentPoints}).`,
      };
    }

    // 5. Capstone Ultimate check (Requires Tier 3 of Branch A OR Branch B)
    if (node.isUltimate) {
      const branchATier3 = config.nodes.find(
        (n) => n.branch === "branch_a" && n.tier === 3
      );
      const branchBTier3 = config.nodes.find(
        (n) => n.branch === "branch_b" && n.tier === 3
      );
      const hasTier3A =
        branchATier3 && unlockedIds.includes(branchATier3.skillId);
      const hasTier3B =
        branchBTier3 && unlockedIds.includes(branchBTier3.skillId);

      if (!hasTier3A && !hasTier3B) {
        return {
          canUnlock: false,
          reason:
            "Requires completing Tier 3 of either branch before unlocking the Ultimate ability.",
        };
      }
    }

    // 6. Branch Prerequisite Skill check
    if (node.requiredSkillId && !unlockedIds.includes(node.requiredSkillId)) {
      const prereqDef = getSkillDefinition(node.requiredSkillId);
      const prereqName = prereqDef ? prereqDef.name : node.requiredSkillId;
      return {
        canUnlock: false,
        reason: `Prerequisite ability not learned: ${prereqName}.`,
      };
    }

    return { canUnlock: true };
  }

  /**
   * Unlocks a skill from the tree, spends Skill Points, and auto-equips into an empty slot if available.
   */
  public static unlockSkill(
    hero: Combatant,
    skillId: string
  ): SkillUnlockResult {
    const initializedHero = this.ensureHeroSkillTreeState(hero);
    const check = this.canUnlockSkill(initializedHero, skillId);
    if (!check.canUnlock) {
      return { success: false, hero: initializedHero, reason: check.reason };
    }

    const nodeInfo = findSkillTreeNode(skillId)!;
    const cost = nodeInfo.node.skillPointCost || 1;
    const newSkillPoints = (initializedHero.skillPoints ?? 0) - cost;
    const newUnlockedIds = [
      ...(initializedHero.unlockedSkillIds ?? []),
      skillId,
    ];

    let updatedHero: Combatant = {
      ...initializedHero,
      skillPoints: newSkillPoints,
      unlockedSkillIds: newUnlockedIds,
    };

    // Auto-equip into first empty flexible slot (indices 1..4)
    let autoEquippedSlot: number | undefined;
    const slots = updatedHero.skillSlots ? [...updatedHero.skillSlots] : [];
    for (let i = 1; i <= 4; i++) {
      const slot = slots.find((s) => s.slotIndex === i);
      if (slot && slot.skillId === null) {
        slot.skillId = skillId;
        autoEquippedSlot = i;
        break;
      }
    }
    updatedHero.skillSlots = slots;

    return {
      success: true,
      hero: updatedHero,
      autoEquippedSlot,
    };
  }

  /**
   * Equips a learned skill from unlockedSkillIds into a flexible slot (slots 1..4).
   * Slot 0 is reserved for the innate Signature skill and cannot be modified.
   */
  public static equipSkillToSlot(
    hero: Combatant,
    skillId: string,
    slotIndex: number
  ): SkillSlotResult {
    if (slotIndex === 0) {
      return {
        success: false,
        hero,
        reason: "Slot 0 is the innate Signature skill and cannot be replaced.",
      };
    }

    if (slotIndex < 1 || slotIndex > 4) {
      return {
        success: false,
        hero,
        reason: `Invalid slot index: ${slotIndex}. Must be 1 to 4.`,
      };
    }

    const initializedHero = this.ensureHeroSkillTreeState(hero);
    const unlocked = initializedHero.unlockedSkillIds ?? [];

    if (!unlocked.includes(skillId)) {
      return {
        success: false,
        hero: initializedHero,
        reason:
          "Skill must be unlocked from the Elemental Skill Tree or learned before equipping.",
      };
    }

    const slots: CombatantSkillSlot[] = initializedHero.skillSlots
      ? initializedHero.skillSlots.map((s) => ({ ...s }))
      : [];

    // Ensure slot entry exists
    let targetSlot = slots.find((s) => s.slotIndex === slotIndex);
    if (!targetSlot) {
      targetSlot = { slotIndex, skillId: null, isSignature: false };
      slots.push(targetSlot);
    }

    targetSlot.skillId = skillId;

    return {
      success: true,
      hero: {
        ...initializedHero,
        skillSlots: slots,
      },
    };
  }

  /**
   * Unequips/clears a flexible slot (slots 1..4).
   */
  public static unequipSkillSlot(
    hero: Combatant,
    slotIndex: number
  ): SkillSlotResult {
    if (slotIndex === 0) {
      return {
        success: false,
        hero,
        reason:
          "Slot 0 is the innate Signature skill and cannot be unequipped.",
      };
    }

    const initializedHero = this.ensureHeroSkillTreeState(hero);
    const slots: CombatantSkillSlot[] = initializedHero.skillSlots
      ? initializedHero.skillSlots.map((s) => ({ ...s }))
      : [];

    const targetSlot = slots.find((s) => s.slotIndex === slotIndex);
    if (targetSlot) {
      targetSlot.skillId = null;
    }

    return {
      success: true,
      hero: {
        ...initializedHero,
        skillSlots: slots,
      },
    };
  }

  /**
   * Gets list of skills unlocked by hero that can be equipped into flexible slots.
   */
  public static getEquippableSkills(hero: Combatant): string[] {
    return hero.unlockedSkillIds ? [...hero.unlockedSkillIds] : [];
  }
}
