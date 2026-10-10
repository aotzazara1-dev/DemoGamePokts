import { Combatant, PlayerRosterState, InnStorageState } from "../types.js";
import { RosterManager } from "./roster-manager.js";

export interface InnDepositResult {
  success: boolean;
  roster: PlayerRosterState;
  storage: InnStorageState;
  depositedBeast?: Combatant;
  reason?: string;
}

export interface InnWithdrawResult {
  success: boolean;
  roster: PlayerRosterState;
  storage: InnStorageState;
  withdrawnBeast?: Combatant;
  reason?: string;
}

/**
 * Domain manager for Inn Beast Storage and Daycare sanctuary (ADR 0022).
 * Strictly <= 400 lines (Anti-God-Files ADR 0020).
 */
export class InnStorageManager {
  public static readonly INN_STORAGE_CAPACITY = 30;

  /**
   * Initializes a fresh InnStorageState with an empty beast reserve list.
   */
  public static createInitialInnStorage(): InnStorageState {
    return {
      beasts: [],
    };
  }

  /**
   * Guarantees a valid InnStorageState object.
   */
  public static ensureInnStorageState(
    storage?: Partial<InnStorageState> | null
  ): InnStorageState {
    if (!storage || !Array.isArray(storage.beasts)) {
      return this.createInitialInnStorage();
    }
    return {
      beasts: [...storage.beasts],
    };
  }

  /**
   * Deposits a beast from the player's active roster into the Inn Storage daycare.
   * - Restores beast HP & SP to 100%.
   * - Guards against depositing the Hero.
   * - Guards against depositing the sole remaining Active Beast.
   */
  public static depositBeast(
    roster: PlayerRosterState,
    storage: InnStorageState,
    beastId: string
  ): InnDepositResult {
    const safeRoster: PlayerRosterState = {
      hero: { ...roster.hero },
      activeBeastId: roster.activeBeastId,
      beasts: roster.beasts.map((b) => ({ ...b })),
      formation: { ...roster.formation },
    };
    const safeStorage: InnStorageState = {
      beasts: storage.beasts.map((b) => ({ ...b })),
    };

    if (beastId === safeRoster.hero.id || safeRoster.hero.name === beastId) {
      return {
        success: false,
        roster,
        storage,
        reason: "ไม่สามารถฝากตัวละครหลักในโรงเตี๊ยมได้",
      };
    }

    const beastIndex = safeRoster.beasts.findIndex((b) => b.id === beastId);
    if (beastIndex === -1) {
      return {
        success: false,
        roster,
        storage,
        reason: "ไม่พบขุนพลนี้ในทีมของคุณ",
      };
    }

    if (safeStorage.beasts.length >= this.INN_STORAGE_CAPACITY) {
      return {
        success: false,
        roster,
        storage,
        reason: `โรงเตี๊ยมรับฝากขุนพลเต็มแล้ว (สูงสุด ${this.INN_STORAGE_CAPACITY} ตัว)`,
      };
    }

    // Active Beast check: if depositing active beast, must have at least one replacement
    if (safeRoster.activeBeastId === beastId) {
      if (safeRoster.beasts.length <= 1) {
        return {
          success: false,
          roster,
          storage,
          reason:
            "ไม่สามารถฝากขุนพลตัวหลักได้เนื่องจากเป็นขุนพลตัวเดียวที่อยู่ในทีม (ต้องมีขุนพลอย่างน้อย 1 ตัว)",
        };
      }

      // Automatically promote the first other beast as new active beast
      const nextBeast = safeRoster.beasts.find((b) => b.id !== beastId);
      if (nextBeast) {
        safeRoster.activeBeastId = nextBeast.id;
      }
    }

    // Remove from roster
    const [targetBeast] = safeRoster.beasts.splice(beastIndex, 1);

    // Full heal in daycare (HP & SP restored to 100%)
    const healedBeast: Combatant = {
      ...targetBeast,
      hp: targetBeast.maxHp,
      sp: targetBeast.maxSp,
    };

    safeStorage.beasts.push(healedBeast);

    return {
      success: true,
      roster: safeRoster,
      storage: safeStorage,
      depositedBeast: healedBeast,
    };
  }

  /**
   * Withdraws a beast from Inn Storage back into the player's active field roster.
   */
  public static withdrawBeast(
    roster: PlayerRosterState,
    storage: InnStorageState,
    beastId: string
  ): InnWithdrawResult {
    const safeRoster: PlayerRosterState = {
      hero: { ...roster.hero },
      activeBeastId: roster.activeBeastId,
      beasts: roster.beasts.map((b) => ({ ...b })),
      formation: { ...roster.formation },
    };
    const safeStorage: InnStorageState = {
      beasts: storage.beasts.map((b) => ({ ...b })),
    };

    if (safeRoster.beasts.length >= RosterManager.MAX_BEAST_CAPACITY) {
      return {
        success: false,
        roster,
        storage,
        reason: `ทีมของคุณมีขุนพลเต็มแล้ว (สูงสุด ${RosterManager.MAX_BEAST_CAPACITY} ตัว)`,
      };
    }

    const storageIndex = safeStorage.beasts.findIndex((b) => b.id === beastId);
    if (storageIndex === -1) {
      return {
        success: false,
        roster,
        storage,
        reason: "ไม่พบขุนพลนี้ในโรงเตี๊ยม",
      };
    }

    const [withdrawnBeast] = safeStorage.beasts.splice(storageIndex, 1);
    safeRoster.beasts.push(withdrawnBeast);

    // If activeBeastId was empty or missing, set this beast as active
    if (
      !safeRoster.activeBeastId ||
      !safeRoster.beasts.some((b) => b.id === safeRoster.activeBeastId)
    ) {
      safeRoster.activeBeastId = withdrawnBeast.id;
    }

    return {
      success: true,
      roster: safeRoster,
      storage: safeStorage,
      withdrawnBeast,
    };
  }
}
