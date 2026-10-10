import { Combatant, CombatAction, BattleEvent } from "../types.js";
import { getSkillDefinition } from "../data/skills.js";
import { SkillManager } from "../skills/skill-manager.js";
import { calculateDamage, getElementMultiplier } from "../formulas.js";

/**
 * Deep Module for resolving combat skill execution (ADR 0021).
 * Handles SP deduction, STAB/cross-element modifiers, heals, buffs,
 * and signals fallback to basic attack on depleted SP.
 */
export class BattleSkillExecutor {
  /**
   * Executes a skill action from actor onto target, updating states and appending battle events.
   * Returns true if skill execution was completed, or false if depleted SP/missing skill requires basic attack fallback.
   */
  public static executeSkill(
    actor: Combatant,
    target: Combatant,
    action: CombatAction,
    events: BattleEvent[]
  ): boolean {
    const skillId = action.skillId;
    const skill = skillId ? getSkillDefinition(skillId) : undefined;

    // 1. Missing skill fallback
    if (!skill) {
      return false;
    }

    // 2. SP validation & surcharge check
    const spCost = SkillManager.getEffectiveSkillCost(actor, skill);
    if (actor.sp < spCost) {
      events.push({
        type: "skill",
        actorId: actor.id,
        targetId: target.id,
        message: `${actor.name} lacks sufficient SP for ${skill.name} (${actor.sp}/${spCost} SP) and reverts to a standard attack!`,
      });
      return false;
    }

    // Deduct SP
    actor.sp = Math.max(0, actor.sp - spCost);
    events.push({
      type: "skill",
      actorId: actor.id,
      targetId: target.id,
      message: `${actor.name} casts ${skill.name}!`,
    });

    // 3. Heal Skills
    if (skill.category === "heal") {
      const healAmount = Math.max(50, Math.round(150 + (actor.int || 0) * 1.5));
      const actualHeal = Math.min(healAmount, target.maxHp - target.hp);
      target.hp += actualHeal;
      events.push({
        type: "heal",
        actorId: actor.id,
        targetId: target.id,
        value: actualHeal,
        message: `${skill.name} restores ${actualHeal} HP to ${target.name}! (${target.hp}/${target.maxHp})`,
      });
      return true;
    }

    // 4. Buff Skills
    if (skill.category === "buff") {
      if (skill.id === "skill_inner_focus") {
        const restored = Math.min(25, actor.maxSp - actor.sp);
        actor.sp += restored;
        events.push({
          type: "sp_restore",
          actorId: actor.id,
          targetId: actor.id,
          value: restored,
          message: `${actor.name} focuses inner spirit and recovers ${restored} SP!`,
        });
        return true;
      }

      let buffDetail = "";
      if (skill.id === "skill_earth_shield") {
        const oldVal = target.def;
        target.def = Math.round(target.def * 1.35);
        buffDetail = `DEF increased from ${oldVal} to ${target.def} (+35%)`;
      } else if (skill.id === "skill_raging_flame") {
        const oldVal = target.atk;
        target.atk = Math.round(target.atk * 1.3);
        buffDetail = `ATK increased from ${oldVal} to ${target.atk} (+30%)`;
      } else if (skill.id === "skill_wind_haste") {
        const oldVal = target.agi;
        target.agi = Math.round(target.agi * 1.35);
        buffDetail = `AGI increased from ${oldVal} to ${target.agi} (+35%)`;
      }

      events.push({
        type: "buff",
        actorId: actor.id,
        targetId: target.id,
        message: `${actor.name} invokes ${skill.name}, empowering ${target.name}!${buffDetail ? ` (${buffDetail})` : ""}`,
      });
      return true;
    }

    // 5. Attack Skills
    const effectiveMultiplier = SkillManager.getEffectiveSkillMultiplier(
      actor,
      skill
    );
    const elemFactor =
      skill.element === "neutral"
        ? 1.0
        : getElementMultiplier(skill.element, target.element);
    const effectiveAtk = actor.atk * effectiveMultiplier;
    let damage = calculateDamage(effectiveAtk, target.def, elemFactor, 1.0);

    if (target.isDefending) {
      damage = Math.max(1, Math.round(damage * 0.5));
    }

    target.hp = Math.max(0, target.hp - damage);

    let effectivenessMsg = "";
    if (skill.element !== "neutral") {
      if (elemFactor > 1.0) effectivenessMsg = " Super effective!";
      else if (elemFactor < 1.0) effectivenessMsg = " Not very effective...";
    }

    events.push({
      type: "damage",
      actorId: actor.id,
      targetId: target.id,
      value: damage,
      message: `${target.name} takes ${damage} damage!${effectivenessMsg ? ` (${effectivenessMsg.trim()})` : ""}`,
    });

    if (target.hp === 0) {
      events.push({
        type: "faint",
        actorId: target.id,
        message: `${target.name} was defeated!`,
      });
    }

    return true;
  }
}
