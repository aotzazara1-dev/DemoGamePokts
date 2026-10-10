import {
  Element,
  Direction,
  InventoryState,
  PlayerRosterState,
  Combatant,
  WarehouseState,
  InnStorageState,
} from "../types.js";

export interface AccountSummary {
  id: string;
  username: string | null;
  isGuest: boolean;
  createdAt: number;
}

export interface AuthSessionResponse {
  token: string;
  account: AccountSummary;
}

export interface HeroSummary {
  id: string;
  accountId: string;
  name: string;
  element: Element;
  level: number;
  mapId: string;
  x: number;
  y: number;
  direction: Direction;
  createdAt: number;
}

export interface CreateHeroPayload {
  name: string;
  element: Element;
}

export interface HeroFullSaveState {
  hero: Combatant;
  accountId: string;
  mapId: string;
  x: number;
  y: number;
  direction: Direction;
  inventory: InventoryState;
  roster: PlayerRosterState;
  warehouse?: WarehouseState;
  innStorage?: InnStorageState;
  createdAt: number;
}

export interface SyncHeroStatePayload {
  x?: number;
  y?: number;
  direction?: Direction;
  mapId?: string;
  inventory?: InventoryState;
  roster?: PlayerRosterState;
  hero?: Combatant;
  warehouse?: WarehouseState;
  innStorage?: InnStorageState;
}
