import { Combatant, CombatAction, BattleEvent } from "../types.js";
import { getSkillDefinition } from "../data/skills.js";
import { SkillManager } from "../skills/skill-manager.js";
import { calculateDamage, getElementMultiplier } from "../formulas.js";

/**
 * Deep Module for resolving combat skill execution (ADR 0021).
 * Handles SP deduction, STAB/cross-element modifiers, heals, buffs,
 * and graceful fallback to basic attack on depleted SP.
 */
export class BattleSkillExecutor {
  /**
   * Executes a skill action from actor onto target, updating states and appending battle events.
   */
  public static executeSkill(
    actor: Combatant,
    target: Combatant,
    action: CombatAction,
    events: BattleEvent[]
  ): void {
    const skillId = action.skillId;
    const skill = skillId ? getSkillDefinition(skillId) : undefined;

    // 1. Missing skill fallback
    if (!skill) {
      this.executeBasicAttackFallback(actor, target, events);
      return;
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
      this.executeBasicAttackFallback(actor, target, events);
      return;
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
      return;
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
        return;
      }

      events.push({
        type: "buff",
        actorId: actor.id,
        targetId: target.id,
        message: `${actor.name} invokes ${skill.name}, empowering ${target.name}!`,
      });
      return;
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
  }

  /**
   * Basic physical attack fallback when SP is insufficient or skill is missing.
   */
  private static executeBasicAttackFallback(
    actor: Combatant,
    target: Combatant,
    events: BattleEvent[]
  ): void {
    const elemFactor = getElementMultiplier(actor.element, target.element);
    let damage = calculateDamage(actor.atk, target.def, elemFactor, 1.0);
    if (target.isDefending) {
      damage = Math.max(1, Math.round(damage * 0.5));
    }
    target.hp = Math.max(0, target.hp - damage);

    events.push({
      type: "attack",
      actorId: actor.id,
      targetId: target.id,
      message: `${actor.name} attacks ${target.name}!`,
    });

    events.push({
      type: "damage",
      actorId: actor.id,
      targetId: target.id,
      value: damage,
      message: `${target.name} takes ${damage} damage!`,
    });

    if (target.hp === 0) {
      events.push({
        type: "faint",
        actorId: target.id,
        message: `${target.name} was defeated!`,
      });
    }
  }
}
