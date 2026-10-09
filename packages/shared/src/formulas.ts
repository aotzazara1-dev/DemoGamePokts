import { Element, type Combatant } from './types.js';

/**
 * Elemental Advantage Cycle:
 * Earth > Water > Fire > Wind > Earth
 * Advantage: 1.5x, Disadvantage: 0.7x, Neutral: 1.0x
 */
const ELEMENT_ADVANTAGES: Record<Element, Element> = {
  [Element.Earth]: Element.Water,
  [Element.Water]: Element.Fire,
  [Element.Fire]: Element.Wind,
  [Element.Wind]: Element.Earth
};

export function getElementMultiplier(attackerElement: Element, defenderElement: Element): number {
  if (attackerElement === defenderElement) {
    return 1.0;
  }

  // Strong against defender
  if (ELEMENT_ADVANTAGES[attackerElement] === defenderElement) {
    return 1.5;
  }

  // Weak against defender
  if (ELEMENT_ADVANTAGES[defenderElement] === attackerElement) {
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
