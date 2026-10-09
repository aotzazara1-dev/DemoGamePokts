import { type Combatant } from '../types.js';

export interface LevelUpResult {
  combatant: Combatant;
  leveledUp: boolean;
  levelsGained: number;
  statPointsGained: number;
  oldLevel: number;
  newLevel: number;
}

export interface StatAllocationResult {
  success: boolean;
  combatant: Combatant;
  allocatedAttribute?: 'atk' | 'def' | 'int' | 'agi';
  reason?: string;
}

export class ProgressionEngine {
  /**
   * Calculates the EXP required to advance from current level to the next level.
   * Formula: floor(50 * level^1.5)
   */
  public static calculateExpToNextLevel(level: number): number {
    const safeLevel = Math.max(1, Math.floor(level));
    return Math.max(50, Math.floor(50 * Math.pow(safeLevel, 1.5)));
  }

  /**
   * Calculates EXP awarded when defeating an enemy of a given level.
   * Formula: floor(30 * level)
   */
  public static calculateEnemyExpReward(level: number): number {
    const safeLevel = Math.max(1, Math.floor(level));
    return Math.max(10, Math.floor(30 * safeLevel));
  }

  /**
   * Awards EXP to a combatant, handling single or multiple level-ups and overflow EXP.
   * On Level Up:
   * - Max HP +15, Max SP +5
   * - Full HP/SP restoration
   * - Hero gains +3 Stat Points, Beasts gain +2 Stat Points per level
   */
  public static addExpToCombatant(combatant: Combatant, expGained: number): LevelUpResult {
    let currentExp = (combatant.exp ?? 0) + Math.max(0, Math.floor(expGained));
    let level = combatant.level;
    let maxHp = combatant.maxHp;
    let maxSp = combatant.maxSp;
    let hp = combatant.hp;
    let sp = combatant.sp;
    let statPoints = combatant.statPoints ?? 0;

    let levelsGained = 0;
    let statPointsGained = 0;
    let maxExp = this.calculateExpToNextLevel(level);

    while (currentExp >= maxExp) {
      currentExp -= maxExp;
      level += 1;
      levelsGained += 1;

      // Base Attribute boosts
      maxHp += 15;
      maxSp += 5;
      hp = maxHp; // Full restore
      sp = maxSp; // Full restore

      // Distributable Stat Points: 3 for Hero, 2 for Beasts
      const pts = combatant.isHero ? 3 : 2;
      statPoints += pts;
      statPointsGained += pts;

      maxExp = this.calculateExpToNextLevel(level);
    }

    const updatedCombatant: Combatant = {
      ...combatant,
      level,
      exp: currentExp,
      maxExp,
      hp,
      maxHp,
      sp,
      maxSp,
      statPoints
    };

    return {
      combatant: updatedCombatant,
      leveledUp: levelsGained > 0,
      levelsGained,
      statPointsGained,
      oldLevel: combatant.level,
      newLevel: level
    };
  }

  /**
   * Allocates 1 Stat Point to a chosen attribute (ATK, DEF, INT, or AGI).
   * - ATK: +1 ATK
   * - DEF: +1 DEF, +10 Max HP
   * - INT: +1 INT, +5 Max SP
   * - AGI: +1 AGI
   */
  public static allocateStatPoint(
    combatant: Combatant,
    attribute: 'atk' | 'def' | 'int' | 'agi'
  ): StatAllocationResult {
    const points = combatant.statPoints ?? 0;
    if (points <= 0) {
      return {
        success: false,
        combatant,
        reason: 'No Stat Points available for allocation.'
      };
    }

    const updated: Combatant = {
      ...combatant,
      statPoints: points - 1
    };

    switch (attribute) {
      case 'atk':
        updated.atk += 1;
        break;
      case 'def':
        updated.def += 1;
        updated.maxHp += 10;
        updated.hp = Math.min(updated.maxHp, updated.hp + 10);
        break;
      case 'int':
        updated.int += 1;
        updated.maxSp += 5;
        updated.sp = Math.min(updated.maxSp, updated.sp + 5);
        break;
      case 'agi':
        updated.agi += 1;
        break;
    }

    return {
      success: true,
      combatant: updated,
      allocatedAttribute: attribute
    };
  }
}
