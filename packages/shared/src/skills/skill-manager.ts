import { Combatant, CombatantSkillSlot, Element } from "../types.js";
import { SkillDefinition, getSkillDefinition } from "../data/skills.js";
import { calculateDamage, getElementMultiplier } from "../formulas.js";

/**
 * Deep Module for 5-Slot Skill Architecture and Elemental Affinity (ADR 0021)
 * Enforces STAB (+25%), Cross-Element Penalty (0.8x), SP Surcharge (+50%),
 * and Forbidden Opposite Element rules.
 */
export class SkillManager {
  public static readonly MAX_SKILL_SLOTS = 5;
  public static readonly STAB_MULTIPLIER = 1.25;
  public static readonly CROSS_ELEMENT_MULTIPLIER = 0.8;
  public static readonly CROSS_ELEMENT_SP_PENALTY = 1.5;

  /**
   * Forbidden Opposite Element (Opposing Cycle):
   * Earth opposes Wind
   * Water opposes Earth
   * Fire opposes Water
   * Wind opposes Fire
   */
  public static readonly FORBIDDEN_OPPOSITE: Record<Element, Element> = {
    [Element.Earth]: Element.Wind,
    [Element.Water]: Element.Earth,
    [Element.Fire]: Element.Water,
    [Element.Wind]: Element.Fire,
  };

  /**
   * Checks if the skill element is the forbidden opposing element for the combatant.
   */
  public static isForbiddenOppositeElement(
    combatantElement: Element,
    skillElement: Element | "neutral"
  ): boolean {
    if (skillElement === "neutral") return false;
    return this.FORBIDDEN_OPPOSITE[combatantElement] === skillElement;
  }

  /**
   * Returns effective SP cost (+50% if cross-element).
   */
  public static getEffectiveSkillCost(
    combatant: Combatant,
    skillOrId: SkillDefinition | string
  ): number {
    const skill =
      typeof skillOrId === "string" ? getSkillDefinition(skillOrId) : skillOrId;
    if (!skill) return 0;
    if (skill.spCost === 0) return 0;

    const isCrossElement =
      skill.element !== "neutral" && skill.element !== combatant.element;
    if (isCrossElement) {
      return Math.ceil(skill.spCost * this.CROSS_ELEMENT_SP_PENALTY);
    }
    return skill.spCost;
  }

  /**
   * Returns effective damage multiplier:
   * - Native Element: +25% STAB bonus
   * - Neutral: 1.0x (normal multiplier)
   * - Cross-Element: 0.8x (-20% off-element penalty)
   */
  public static getEffectiveSkillMultiplier(
    combatant: Combatant,
    skillOrId: SkillDefinition | string
  ): number {
    const skill =
      typeof skillOrId === "string" ? getSkillDefinition(skillOrId) : skillOrId;
    if (!skill) return 1.0;

    if (skill.element === combatant.element) {
      return Number((skill.multiplier * this.STAB_MULTIPLIER).toFixed(2));
    }
    if (skill.element === "neutral") {
      return skill.multiplier;
    }
    return Number(
      (skill.multiplier * this.CROSS_ELEMENT_MULTIPLIER).toFixed(2)
    );
  }

  /**
   * Calculates projected damage for a skill attack, accounting for attacker/defender stats,
   * STAB/cross-element modifiers, and elemental advantages.
   */
  public static calculateSkillDamage(
    attacker: Combatant,
    defender: Combatant,
    skillOrId: SkillDefinition | string
  ): number {
    const skill =
      typeof skillOrId === "string" ? getSkillDefinition(skillOrId) : skillOrId;
    if (!skill || skill.category !== "attack") return 0;

    const effectiveMultiplier = this.getEffectiveSkillMultiplier(
      attacker,
      skill
    );
    const elemFactor =
      skill.element === "neutral"
        ? 1.0
        : getElementMultiplier(skill.element, defender.element);
    const effectiveAtk = attacker.atk * effectiveMultiplier;
    return calculateDamage(effectiveAtk, defender.def, elemFactor, 1.0);
  }

  /**
   * Ensures the combatant has an initialized array of 5 skill slots.
   */
  public static ensureSkillSlots(combatant: Combatant): CombatantSkillSlot[] {
    if (
      !combatant.skillSlots ||
      combatant.skillSlots.length !== this.MAX_SKILL_SLOTS
    ) {
      combatant.skillSlots = this.createStarterSkillSlots(
        combatant.id,
        combatant.element,
        combatant.isHero
      );
    }
    return combatant.skillSlots;
  }

  /**
   * Validates whether a combatant can learn a given skill into a target slot.
   */
  public static canLearnSkill(
    combatant: Combatant,
    skillId: string,
    slotIndex?: number
  ): { canLearn: boolean; reason?: string } {
    const skill = getSkillDefinition(skillId);
    if (!skill) {
      return { canLearn: false, reason: "Skill does not exist." };
    }

    if (this.isForbiddenOppositeElement(combatant.element, skill.element)) {
      return {
        canLearn: false,
        reason: `Cannot learn ${skill.name}! ${combatant.element} entities cannot harness opposing ${skill.element} energy.`,
      };
    }

    const slots = this.ensureSkillSlots(combatant);

    // Prevent duplicate skill in multiple slots
    const isAlreadyLearned = slots.some((s) => s.skillId === skillId);
    if (isAlreadyLearned) {
      return {
        canLearn: false,
        reason: `${combatant.name} already knows ${skill.name}.`,
      };
    }

    if (slotIndex !== undefined) {
      if (slotIndex < 0 || slotIndex >= this.MAX_SKILL_SLOTS) {
        return { canLearn: false, reason: "Invalid skill slot index." };
      }
      if (slots[slotIndex].isSignature) {
        return {
          canLearn: false,
          reason: "Cannot replace an innate Signature skill.",
        };
      }
    } else {
      // Find at least one non-signature slot
      const hasFlexibleSlot = slots.some((s) => !s.isSignature);
      if (!hasFlexibleSlot) {
        return {
          canLearn: false,
          reason: "No flexible skill slots available to learn new skills.",
        };
      }
    }

    return { canLearn: true };
  }

  /**
   * Teaches a skill to a combatant, placing it in an empty slot or overwriting target slot.
   */
  public static learnSkill(
    combatant: Combatant,
    skillId: string,
    targetSlotIndex?: number
  ): {
    success: boolean;
    combatant: Combatant;
    slotIndex?: number;
    message?: string;
    reason?: string;
  } {
    const validation = this.canLearnSkill(combatant, skillId, targetSlotIndex);
    if (!validation.canLearn) {
      return {
        success: false,
        combatant,
        reason: validation.reason,
      };
    }

    const slots = this.ensureSkillSlots(combatant);
    const skill = getSkillDefinition(skillId)!;

    let targetIdx = targetSlotIndex;
    if (targetIdx === undefined) {
      // First try to find an empty non-signature slot
      const emptyIdx = slots.findIndex(
        (s) => !s.isSignature && s.skillId === null
      );
      if (emptyIdx !== -1) {
        targetIdx = emptyIdx;
      } else {
        // Fallback to first non-signature slot (overwrite)
        targetIdx = slots.findIndex((s) => !s.isSignature);
      }
    }

    const prevSkillId = slots[targetIdx].skillId;
    slots[targetIdx] = {
      slotIndex: targetIdx,
      skillId,
      isSignature: false,
    };

    const prevSkill = prevSkillId ? getSkillDefinition(prevSkillId) : null;
    const msg = prevSkill
      ? `${combatant.name} replaced ${prevSkill.name} with ${skill.name} in Slot ${targetIdx + 1}!`
      : `${combatant.name} learned ${skill.name} in Slot ${targetIdx + 1}!`;

    return {
      success: true,
      combatant,
      slotIndex: targetIdx,
      message: msg,
    };
  }

  /**
   * Forgets a skill from a flexible slot.
   */
  public static forgetSkill(
    combatant: Combatant,
    slotIndex: number
  ): { success: boolean; combatant: Combatant; reason?: string } {
    const slots = this.ensureSkillSlots(combatant);
    if (slotIndex < 0 || slotIndex >= this.MAX_SKILL_SLOTS) {
      return { success: false, combatant, reason: "Invalid slot index." };
    }

    if (slots[slotIndex].isSignature) {
      return {
        success: false,
        combatant,
        reason: "Cannot forget an innate Signature skill.",
      };
    }

    slots[slotIndex].skillId = null;
    return { success: true, combatant };
  }

  /**
   * Creates initial 5 skill slots based on entity identity and element.
   */
  public static createStarterSkillSlots(
    idOrName: string,
    element: Element,
    isHero: boolean
  ): CombatantSkillSlot[] {
    const idLower = idOrName.toLowerCase();

    // Starter Champions (Record of Ragnarok)
    if (idLower.includes("lu_bu") || idLower.includes("lubu")) {
      return [
        { slotIndex: 0, skillId: "skill_sky_piercer", isSignature: true },
        { slotIndex: 1, skillId: "skill_god_of_war_rage", isSignature: true },
        { slotIndex: 2, skillId: "flame_strike", isSignature: false },
        { slotIndex: 3, skillId: null, isSignature: false },
        { slotIndex: 4, skillId: null, isSignature: false },
      ];
    }

    if (idLower.includes("kojiro") || idLower.includes("sasaki")) {
      return [
        { slotIndex: 0, skillId: "skill_tsubame_gaeshi", isSignature: true },
        { slotIndex: 1, skillId: "skill_thousand_images", isSignature: true },
        { slotIndex: 2, skillId: "aqua_jet", isSignature: false },
        { slotIndex: 3, skillId: null, isSignature: false },
        { slotIndex: 4, skillId: null, isSignature: false },
      ];
    }

    if (idLower.includes("adam")) {
      return [
        { slotIndex: 0, skillId: "skill_eyes_of_the_lord", isSignature: true },
        { slotIndex: 1, skillId: "skill_father_strike", isSignature: true },
        { slotIndex: 2, skillId: "rock_throw", isSignature: false },
        { slotIndex: 3, skillId: null, isSignature: false },
        { slotIndex: 4, skillId: null, isSignature: false },
      ];
    }

    if (idLower.includes("thor")) {
      return [
        { slotIndex: 0, skillId: "skill_geirrod_hammer", isSignature: true },
        { slotIndex: 1, skillId: "skill_thunder_clap", isSignature: true },
        { slotIndex: 2, skillId: "gale_slash", isSignature: false },
        { slotIndex: 3, skillId: null, isSignature: false },
        { slotIndex: 4, skillId: null, isSignature: false },
      ];
    }

    // Hero
    if (isHero) {
      let heroSig = "skill_hero_ocean_tide";
      let heroCommon = "aqua_jet";

      if (element === Element.Earth) {
        heroSig = "skill_hero_earth_breaker";
        heroCommon = "rock_throw";
      } else if (element === Element.Fire) {
        heroSig = "skill_hero_blazing_slash";
        heroCommon = "flame_strike";
      } else if (element === Element.Wind) {
        heroSig = "skill_hero_storm_surge";
        heroCommon = "gale_slash";
      }

      return [
        { slotIndex: 0, skillId: heroSig, isSignature: true },
        { slotIndex: 1, skillId: heroCommon, isSignature: false },
        { slotIndex: 2, skillId: null, isSignature: false },
        { slotIndex: 3, skillId: null, isSignature: false },
        { slotIndex: 4, skillId: null, isSignature: false },
      ];
    }

    // Default wild beast / generic champion
    let defaultBasic = "rock_throw";
    if (element === Element.Water) defaultBasic = "aqua_jet";
    else if (element === Element.Fire) defaultBasic = "flame_strike";
    else if (element === Element.Wind) defaultBasic = "gale_slash";

    return [
      { slotIndex: 0, skillId: defaultBasic, isSignature: true },
      { slotIndex: 1, skillId: null, isSignature: false },
      { slotIndex: 2, skillId: null, isSignature: false },
      { slotIndex: 3, skillId: null, isSignature: false },
      { slotIndex: 4, skillId: null, isSignature: false },
    ];
  }
}
