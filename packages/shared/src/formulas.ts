import { Element, type Combatant } from './types.js';

/**
 * Elemental Advantage Cycle:
 * Earth > Water > Fire > Wind > Earth
 * Advantage: 1.5x, Disadvantage: 0.7x, Neutral: 1.0x
 */
export function getElementMultiplier(attackerElement: Element, defenderElement: Element): number {
  if (
    (attackerElement === Element.Earth && defenderElement === Element.Water) ||
    (attackerElement === Element.Water && defenderElement === Element.Fire) ||
    (attackerElement === Element.Fire && defenderElement === Element.Wind) ||
    (attackerElement === Element.Wind && defenderElement === Element.Earth)
  ) {
    return 1.5;
  }

  if (
    (attackerElement === Element.Water && defenderElement === Element.Earth) ||
    (attackerElement === Element.Fire && defenderElement === Element.Water) ||
    (attackerElement === Element.Wind && defenderElement === Element.Fire) ||
    (attackerElement === Element.Earth && defenderElement === Element.Wind)
  ) {
    return 0.7;
  }

  return 1.0;
}

/**
 * Classic Subtractive Physical Damage Calculation:
 * Damage = Math.max(1, (atk * 2) - def) * elementMultiplier * comboMultiplier
 */
export function calculateDamage(
  attackerAtk: number,
  defenderDef: number,
  elementMultiplier: number = 1.0,
  comboMultiplier: number = 1.0
): number {
  const baseDamage = Math.max(1, (attackerAtk * 2) - defenderDef);
  return Math.round(baseDamage * elementMultiplier * comboMultiplier);
}

/**
 * Combo Detection:
 * Triggers when two allied units attack the same target and |AGI difference| <= 15
 */
export function canTriggerCombo(unitA: Combatant, unitB: Combatant): boolean {
  if (unitA.hp <= 0 || unitB.hp <= 0) {
    return false;
  }

  if (unitA.action?.type !== 'attack' || unitB.action?.type !== 'attack') {
    return false;
  }

  if (!unitA.action.targetId || !unitB.action.targetId) {
    return false;
  }

  if (unitA.action.targetId !== unitB.action.targetId) {
    return false;
  }

  return Math.abs(unitA.agi - unitB.agi) <= 15;
}
