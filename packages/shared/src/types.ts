/**
 * Core Domain Types for Poktsonline
 * Aligned with GLOSSARY.md and ADRs
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

export interface TeamFormation {
  front: (Combatant | null)[];
  back: (Combatant | null)[];
}

export type BattleOutcome = 'ongoing' | 'victory' | 'defeat' | 'escaped';

export interface BattleState {
  round: number;
  outcome: BattleOutcome;
  allies: TeamFormation;
  enemies: TeamFormation;
  capturedBeastIds: string[];
}

export type TeamActionsMap = Record<string, CombatAction>;

export type BattleEventType =
  | 'attack'
  | 'damage'
  | 'blocked'
  | 'combo'
  | 'defend'
  | 'heal'
  | 'capture_success'
  | 'capture_fail'
  | 'faint'
  | 'flee'
  | 'victory'
  | 'defeat';

export interface BattleEvent {
  type: BattleEventType;
  actorId: string;
  targetId?: string;
  value?: number;
  message: string;
}

export interface TurnResolutionResult {
  nextState: BattleState;
  events: BattleEvent[];
}
