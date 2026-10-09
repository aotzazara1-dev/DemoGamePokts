/**
 * Core Domain Types for Poktsonline
 * Aligned with GLOSSARY.md and ADR 0003
 */

export enum Element {
  Earth = 'Earth',
  Water = 'Water',
  Fire = 'Fire',
  Wind = 'Wind'
}

export type CombatActionType = 'attack' | 'skill' | 'defend' | 'capture' | 'item' | 'flee';

export interface CombatAction {
  type: CombatActionType;
  targetId?: string;
  skillId?: string;
  itemId?: string;
}

export interface Attributes {
  hp: number;
  maxHp: number;
  sp: number;
  maxSp: number;
  atk: number;
  def: number;
  int: number;
  agi: number;
}

export interface Combatant extends Attributes {
  id: string;
  name: string;
  isHero: boolean;
  level: number;
  element: Element;
  action?: CombatAction;
  isDefending?: boolean;
}
