import {
  type BattleState,
  type TeamFormation,
  type TeamActionsMap,
  type TurnResolutionResult,
  type BattleEvent,
  type Combatant,
  type BattleOutcome
} from '../types.js';
import { calculateDamage, getElementMultiplier, canTriggerCombo } from '../formulas.js';

export class BattleEngine {
  /**
   * Deterministically resolves one full round of combat.
   * Pure function: does not mutate the passed state.
   */
  public static resolveTurn(
    state: BattleState,
    actions: TeamActionsMap,
    rng: () => number = Math.random
  ): TurnResolutionResult {
    // 1. Deep clone state
    const nextState: BattleState = JSON.parse(JSON.stringify(state));
    const events: BattleEvent[] = [];

    // Helper to find combatant in state and its position
    function findCombatant(id: string): { unit: Combatant; team: 'allies' | 'enemies'; row: 'front' | 'back'; col: number } | null {
      for (let c = 0; c < 5; c++) {
        if (nextState.allies.front[c]?.id === id) return { unit: nextState.allies.front[c]!, team: 'allies', row: 'front', col: c };
        if (nextState.allies.back[c]?.id === id) return { unit: nextState.allies.back[c]!, team: 'allies', row: 'back', col: c };
        if (nextState.enemies.front[c]?.id === id) return { unit: nextState.enemies.front[c]!, team: 'enemies', row: 'front', col: c };
        if (nextState.enemies.back[c]?.id === id) return { unit: nextState.enemies.back[c]!, team: 'enemies', row: 'back', col: c };
      }
      return null;
    }

    // Helper to check living units in a team
    function countLiving(formation: TeamFormation): number {
      let count = 0;
      for (const slot of formation.front) if (slot && slot.hp > 0) count++;
      for (const slot of formation.back) if (slot && slot.hp > 0) count++;
      return count;
    }

    // 2. Assign actions & reset defending stance
    const allLivingUnits: Combatant[] = [];
    ['allies', 'enemies'].forEach(teamKey => {
      const team = nextState[teamKey as 'allies' | 'enemies'];
      ['front', 'back'].forEach(rowKey => {
        const row = team[rowKey as 'front' | 'back'];
        row.forEach(slot => {
          if (slot && slot.hp > 0) {
            slot.isDefending = false;
            if (actions[slot.id]) {
              slot.action = actions[slot.id];
            }
            // Pre-process Defend action
            if (slot.action?.type === 'defend') {
              slot.isDefending = true;
              events.push({
                type: 'defend',
                actorId: slot.id,
                message: `${slot.name} assumes a defensive guard!`
              });
            }
            allLivingUnits.push(slot);
          }
        });
      });
    });

    // 3. Initiative order: sort all units by AGI descending
    allLivingUnits.sort((a, b) => b.agi - a.agi);

    // Track units that have already acted (e.g. executed as part of a Combo)
    const actedUnitIds = new Set<string>();

    // 4. Check for combo between allied units
    const allyLiving = allLivingUnits.filter(u => findCombatant(u.id)?.team === 'allies');
    let comboExecuted = false;

    if (allyLiving.length >= 2) {
      for (let i = 0; i < allyLiving.length; i++) {
        for (let j = i + 1; j < allyLiving.length; j++) {
          const uA = allyLiving[i];
          const uB = allyLiving[j];

          if (canTriggerCombo(uA, uB)) {
            const targetInfo = findCombatant(uA.action!.targetId!);
            if (targetInfo && targetInfo.unit.hp > 0) {
              // Execute Combo
              const target = targetInfo.unit;
              const combinedAtk = (uA.atk + uB.atk) * 1.8;
              const elemFactor = getElementMultiplier(uA.element, target.element);
              let totalDamage = Math.round(Math.max(1, combinedAtk - target.def) * elemFactor);

              if (target.isDefending) {
                totalDamage = Math.max(1, Math.round(totalDamage * 0.5));
              }

              target.hp = Math.max(0, target.hp - totalDamage);

              events.push({
                type: 'combo',
                actorId: uA.id,
                targetId: target.id,
                value: totalDamage,
                message: `COORDINATED COMBO! ${uA.name} and ${uB.name} strike ${target.name} for ${totalDamage} damage!`
              });

              if (target.hp === 0) {
                events.push({
                  type: 'faint',
                  actorId: target.id,
                  message: `${target.name} has fallen!`
                });
              }

              actedUnitIds.add(uA.id);
              actedUnitIds.add(uB.id);
              comboExecuted = true;
              break;
            }
          }
        }
        if (comboExecuted) break;
      }
    }

    // 5. Resolve remaining individual actions in AGI sequence
    for (const actor of allLivingUnits) {
      if (actor.hp <= 0 || actedUnitIds.has(actor.id)) {
        continue;
      }

      if (!actor.action || actor.action.type === 'defend') {
        continue;
      }

      if (actor.action.type === 'item') {
        actor.hp = Math.min(actor.maxHp, actor.hp + 80);
        events.push({
          type: 'heal',
          actorId: actor.id,
          value: 80,
          message: `${actor.name} used an item and recovered 80 HP.`
        });
        continue;
      }

      if (actor.action.type === 'flee') {
        const roll = rng();
        if (roll >= 0.4) {
          nextState.outcome = 'escaped';
          events.push({
            type: 'flee',
            actorId: actor.id,
            message: `${actor.name} successfully escaped the battle!`
          });
          return { nextState, events };
        } else {
          events.push({
            type: 'flee',
            actorId: actor.id,
            message: `${actor.name} failed to escape!`
          });
          continue;
        }
      }

      // Action requires a valid target
      const targetId = actor.action.targetId;
      if (!targetId) continue;

      const targetInfo = findCombatant(targetId);
      if (!targetInfo || targetInfo.unit.hp <= 0) {
        continue;
      }

      const target = targetInfo.unit;

      // Handle Capture action
      if (actor.action.type === 'capture') {
        if (!actor.isHero) {
          events.push({
            type: 'capture_fail',
            actorId: actor.id,
            targetId: target.id,
            message: `Only Heroes can capture wild Beasts.`
          });
          continue;
        }

        if (actor.level < target.level) {
          events.push({
            type: 'capture_fail',
            actorId: actor.id,
            targetId: target.id,
            message: `Capture failed: Hero level is lower than target Beast level.`
          });
          continue;
        }

        const hpRatio = target.hp / target.maxHp;
        const captureChance = Math.max(0.15, (1.0 - hpRatio) * 0.9);
        const roll = rng();

        if (roll <= captureChance) {
          target.hp = 0;
          nextState.capturedBeastIds.push(target.id);
          events.push({
            type: 'capture_success',
            actorId: actor.id,
            targetId: target.id,
            message: `Successfully captured ${target.name}!`
          });
        } else {
          events.push({
            type: 'capture_fail',
            actorId: actor.id,
            targetId: target.id,
            message: `${target.name} broke free from the capture net!`
          });
        }
        continue;
      }

      // Handle Attack or Skill:
      // Front Row Shielding check:
      // If direct physical melee attack targets Back Row at column c,
      // and target team has a living Front Row unit at column c, the attack is BLOCKED!
      if (actor.action.type === 'attack' && targetInfo.row === 'back') {
        const opposingTeam = nextState[targetInfo.team];
        const frontGuard = opposingTeam.front[targetInfo.col];
        if (frontGuard && frontGuard.hp > 0) {
          events.push({
            type: 'blocked',
            actorId: actor.id,
            targetId: target.id,
            message: `${actor.name}'s melee attack on ${target.name} was intercepted by ${frontGuard.name} in the Front Row!`
          });
          continue;
        }
      }

      // Calculate Damage
      const isSkill = actor.action.type === 'skill';
      if (isSkill) {
        actor.sp = Math.max(0, actor.sp - 15);
      }

      const elemFactor = getElementMultiplier(actor.element, target.element);
      const effectiveAtk = isSkill ? actor.atk * 1.3 : actor.atk;
      let damage = calculateDamage(effectiveAtk, target.def, elemFactor, 1.0);

      if (target.isDefending) {
        damage = Math.max(1, Math.round(damage * 0.5));
      }

      target.hp = Math.max(0, target.hp - damage);

      events.push({
        type: 'attack',
        actorId: actor.id,
        targetId: target.id,
        message: `${actor.name} attacks ${target.name}!`
      });

      events.push({
        type: 'damage',
        actorId: actor.id,
        targetId: target.id,
        value: damage,
        message: `${target.name} takes ${damage} damage!`
      });

      if (target.hp === 0) {
        events.push({
          type: 'faint',
          actorId: target.id,
          message: `${target.name} was defeated!`
        });
      }
    }

    // 6. Check End-of-Round Battle Outcomes
    const livingEnemies = countLiving(nextState.enemies);
    const livingAllies = countLiving(nextState.allies);

    if (livingEnemies === 0) {
      nextState.outcome = 'victory';
      events.push({
        type: 'victory',
        actorId: 'system',
        message: 'All enemies have been vanquished! Victory!'
      });
    } else if (livingAllies === 0) {
      nextState.outcome = 'defeat';
      events.push({
        type: 'defeat',
        actorId: 'system',
        message: 'All friendly combatants have fallen. Defeat.'
      });
    } else {
      nextState.round += 1;
      nextState.outcome = 'ongoing';
    }

    return { nextState, events };
  }
}
