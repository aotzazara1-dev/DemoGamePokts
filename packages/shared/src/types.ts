/**
 * Core Domain Types for Poktsonline
 * Aligned with GLOSSARY.md and ADRs
 */

export enum Element {
  Earth = "Earth",
  Water = "Water",
  Fire = "Fire",
  Wind = "Wind",
}

export type CombatActionType =
  "attack" | "skill" | "defend" | "pass" | "capture" | "item" | "flee";

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

export interface CombatantSkillSlot {
  slotIndex: number; // 0..4
  skillId: string | null;
  isSignature: boolean;
}

export interface Combatant extends Attributes {
  id: string;
  name: string;
  isHero: boolean;
  level: number;
  element: Element;
  exp?: number;
  maxExp?: number;
  statPoints?: number;
  action?: CombatAction;
  isDefending?: boolean;
  equipment?: EntityEquipment;
  baseAttributes?: Attributes;
  skillSlots?: CombatantSkillSlot[];
}

export interface TeamFormation {
  front: (Combatant | null)[];
  back: (Combatant | null)[];
}

export type BattleOutcome = "ongoing" | "victory" | "defeat" | "escaped";

export interface BattleState {
  round: number;
  outcome: BattleOutcome;
  allies: TeamFormation;
  enemies: TeamFormation;
  capturedBeastIds: string[];
}

export type TeamActionsMap = Record<string, CombatAction>;

export type BattleEventType =
  | "attack"
  | "skill"
  | "damage"
  | "blocked"
  | "combo"
  | "defend"
  | "pass"
  | "heal"
  | "sp_restore"
  | "buff"
  | "revive"
  | "capture_success"
  | "capture_fail"
  | "faint"
  | "flee"
  | "victory"
  | "defeat";

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

// --- OVERWORLD TYPES ---

export interface TileCoord {
  x: number;
  y: number;
}

export type Direction =
  | "up"
  | "down"
  | "left"
  | "right"
  | "up-left"
  | "up-right"
  | "down-left"
  | "down-right";

export type ZoneType = "safe" | "wild";

export interface ZoneBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface EncounterPoolEntry {
  beastTemplateId: string;
  name: string;
  element: Element;
  baseLevel: number;
  levelVariance: number;
  weight: number;
  baseAtk: number;
  baseDef: number;
  baseAgi: number;
  baseHp: number;
  baseSp: number;
}

export interface ZoneDefinition {
  id: string;
  name: string;
  type: ZoneType;
  bounds: ZoneBounds;
  encounterRatePerStep: number;
  encounterPool: EncounterPoolEntry[];
}

export interface PortalDefinition {
  id: string;
  position: TileCoord;
  targetMapId: string;
  targetPosition: TileCoord;
  name: string;
}

export interface NPCDialogueOption {
  id: string;
  label: string;
  action: "shop" | "heal" | "advice" | "close";
  response?: string;
}

export interface NPCDefinition {
  id: string;
  name: string;
  title: string;
  avatarIcon: string;
  spriteKey: string;
  position: TileCoord;
  greeting: string;
  options: NPCDialogueOption[];
  shopItemIds?: string[];
}

export type MapTheme =
  "meadow" | "cave" | "forest" | "coliseum" | "sanctuary" | "abyss";

export interface MapConfig {
  id: string;
  name: string;
  theme: MapTheme;
  width: number;
  height: number;
  obstacles: TileCoord[];
  zones: ZoneDefinition[];
  portals: PortalDefinition[];
  npcs?: NPCDefinition[];
}

export interface PlayerOverworldState {
  playerId: string;
  position: TileCoord;
  facingDirection: Direction;
  stepsInCurrentZone: number;
}

export interface MovementResult {
  success: boolean;
  newPosition: TileCoord;
  previousPosition: TileCoord;
  stepsInZone: number;
  encounterTriggered: boolean;
  encounter?: {
    zoneId: string;
    wildEnemies: Combatant[];
  };
  portalTriggered?: boolean;
  portal?: PortalDefinition;
  reason?: "out_of_bounds" | "obstacle_blocked" | "invalid_distance";
}

export interface FormationSlot {
  row: "front" | "back";
  col: number; // 0..4
}

export interface PlayerRosterState {
  hero: Combatant;
  activeBeastId: string;
  beasts: Combatant[];
  formation: {
    heroSlot: FormationSlot;
    beastSlot: FormationSlot;
  };
}

export type EquipmentSlot = "weapon" | "head" | "armor" | "boots" | "accessory";

export type EntityEquipment = Record<EquipmentSlot, string | null>;

export interface EquipmentStats {
  atk?: number;
  def?: number;
  int?: number;
  agi?: number;
  maxHp?: number;
  maxSp?: number;
}

export type ItemCategory = "all" | "consumable" | "equipment" | "material";

export type ItemType =
  | "hp_restore"
  | "sp_restore"
  | "revive"
  | "scroll"
  | "loot"
  | "equipment"
  | "material";

export interface ItemDefinition {
  id: string;
  name: string;
  type: ItemType;
  category?: ItemCategory;
  effectValue: number;
  description: string;
  price: number;
  sellPrice?: number;
  stackMax: number;
  usableInCombat: boolean;
  usableOnOverworld: boolean;
  slot?: EquipmentSlot;
  stats?: EquipmentStats;
  requiredLevel?: number;
  skillId?: string;
}

export interface ItemStack {
  itemId: string;
  quantity: number;
}

export interface InventoryState {
  slots: (ItemStack | null)[];
  gold: number;
}

export interface LootReward {
  gold: number;
  droppedItems: ItemStack[];
}

export interface MoveMessagePayload {
  targetX: number;
  targetY: number;
  mapId?: string;
}

export interface PortalTransitionPayload {
  targetMapId: string;
  targetPosition: TileCoord;
  portalName?: string;
}

export interface PortalTransitionMessage {
  mapId: string;
  x: number;
  y: number;
  portalName?: string;
}

export interface RoamingBeastEntity {
  id: string;
  templateId: string;
  name: string;
  element: Element;
  level: number;
  mapId: string;
  zoneId: string;
  x: number;
  y: number;
  direction?: Direction;
  inCombat: boolean;
  respawnAt: number;
  baseAtk: number;
  baseDef: number;
  baseAgi: number;
  baseHp: number;
  baseSp: number;
}
