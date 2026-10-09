import { Combatant, LootReward, ItemStack } from '../types.js';

export class LootEngine {
  /**
   * Calculates Gold and item drops from defeated wild combatants.
   * Accepts an optional customRandom function for deterministic unit testing.
   */
  public static calculateLoot(
    defeatedEnemies: Combatant[],
    customRandom: () => number = Math.random
  ): LootReward {
    if (!defeatedEnemies || defeatedEnemies.length === 0) {
      return { gold: 0, droppedItems: [] };
    }

    let totalGold = 0;
    const itemCounts: Record<string, number> = {};

    for (const enemy of defeatedEnemies) {
      // 1. Calculate Gold: ~20-30 Gold per monster level
      const level = Math.max(1, enemy.level);
      const goldRoll = 20 + Math.floor(customRandom() * 11); // 20..30
      totalGold += level * goldRoll;

      // 2. Drop Item Roll (45% probability)
      const dropRoll = customRandom();
      if (dropRoll < 0.45) {
        const itemRoll = customRandom();
        let droppedItemId = 'item_steamed_bun';

        if (itemRoll < 0.50) {
          droppedItemId = 'item_steamed_bun';
        } else if (itemRoll < 0.85) {
          droppedItemId = 'item_herbal_tea';
        } else {
          droppedItemId = 'item_vitality_pill';
        }

        itemCounts[droppedItemId] = (itemCounts[droppedItemId] || 0) + 1;
      }
    }

    const droppedItems: ItemStack[] = Object.entries(itemCounts).map(([itemId, quantity]) => ({
      itemId,
      quantity
    }));

    return {
      gold: totalGold,
      droppedItems
    };
  }
}
