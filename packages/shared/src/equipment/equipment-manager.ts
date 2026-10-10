import {
  EquipmentSlot,
  EntityEquipment,
  EquipmentStats,
  Attributes,
  Combatant,
  InventoryState,
  ItemDefinition,
} from "../types.js";
import { getItemDefinition } from "../inventory/item-database.js";
import { InventoryManager } from "../inventory/inventory-manager.js";

export class EquipmentManager {
  public static readonly SLOTS: EquipmentSlot[] = [
    "weapon",
    "head",
    "armor",
    "boots",
    "accessory",
  ];

  /**
   * Creates an empty equipment object with all 5 slots initialized to null.
   */
  public static createEmptyEquipment(): EntityEquipment {
    return {
      weapon: null,
      head: null,
      armor: null,
      boots: null,
      accessory: null,
    };
  }

  /**
   * Calculates the cumulative bonus stats granted by all equipped gear.
   */
  public static getEquipmentBonusStats(
    equipment?: EntityEquipment | null
  ): EquipmentStats {
    const total: EquipmentStats = {
      atk: 0,
      def: 0,
      int: 0,
      agi: 0,
      maxHp: 0,
      maxSp: 0,
    };

    if (!equipment) return total;

    for (const slot of this.SLOTS) {
      const itemId = equipment[slot];
      if (!itemId) continue;
      const def = getItemDefinition(itemId);
      if (def?.stats) {
        if (def.stats.atk) total.atk = (total.atk || 0) + def.stats.atk;
        if (def.stats.def) total.def = (total.def || 0) + def.stats.def;
        if (def.stats.int) total.int = (total.int || 0) + def.stats.int;
        if (def.stats.agi) total.agi = (total.agi || 0) + def.stats.agi;
        if (def.stats.maxHp) total.maxHp = (total.maxHp || 0) + def.stats.maxHp;
        if (def.stats.maxSp) total.maxSp = (total.maxSp || 0) + def.stats.maxSp;
      }
    }

    return total;
  }

  /**
   * Computes the effective attributes by combining base attributes with equipment bonuses.
   */
  public static calculateEffectiveAttributes(
    base: Attributes,
    equipment?: EntityEquipment | null
  ): Attributes {
    const bonus = this.getEquipmentBonusStats(equipment);

    const maxHp = base.maxHp + (bonus.maxHp || 0);
    const maxSp = base.maxSp + (bonus.maxSp || 0);
    const atk = base.atk + (bonus.atk || 0);
    const def = base.def + (bonus.def || 0);
    const int = base.int + (bonus.int || 0);
    const agi = base.agi + (bonus.agi || 0);
    const hp = Math.min(base.hp, maxHp);
    const sp = Math.min(base.sp, maxSp);

    return {
      hp,
      maxHp,
      sp,
      maxSp,
      atk,
      def,
      int,
      agi,
    };
  }

  /**
   * Applies equipment to a combatant (Hero or Champion), setting effective stats while preserving base stats.
   */
  public static applyEquipmentToCombatant(
    combatant: Combatant,
    equipment: EntityEquipment
  ): Combatant {
    const baseAttrs: Attributes = combatant.baseAttributes || {
      hp: combatant.hp,
      maxHp: combatant.maxHp,
      sp: combatant.sp,
      maxSp: combatant.maxSp,
      atk: combatant.atk,
      def: combatant.def,
      int: combatant.int,
      agi: combatant.agi,
    };

    const effective = this.calculateEffectiveAttributes(baseAttrs, equipment);

    return {
      ...combatant,
      ...effective,
      baseAttributes: baseAttrs,
      equipment: { ...equipment },
    };
  }

  /**
   * Verifies if an entity meets level and slot requirements for an item.
   */
  public static canEquip(
    item: ItemDefinition,
    level: number = 1
  ): { canEquip: boolean; reason?: string } {
    if (item.type !== "equipment" || !item.slot) {
      return {
        canEquip: false,
        reason: `${item.name} is not an equipable item.`,
      };
    }

    if (item.requiredLevel && level < item.requiredLevel) {
      return {
        canEquip: false,
        reason: `Requires Level ${item.requiredLevel} (Current: ${level}).`,
      };
    }

    return { canEquip: true };
  }

  /**
   * Equips an item from the player's inventory to an entity's equipment slot.
   * If slot is occupied, swaps with the previously equipped item.
   */
  public static equipItem(
    inventory: InventoryState,
    equipment: EntityEquipment,
    itemId: string,
    level: number = 1
  ): {
    success: boolean;
    inventory: InventoryState;
    equipment: EntityEquipment;
    swappedItemId?: string | null;
    reason?: string;
  } {
    const def = getItemDefinition(itemId);
    if (!def) {
      return {
        success: false,
        inventory,
        equipment,
        reason: `Unknown item: ${itemId}`,
      };
    }

    const check = this.canEquip(def, level);
    if (!check.canEquip) {
      return { success: false, inventory, equipment, reason: check.reason };
    }

    if (!InventoryManager.hasItem(inventory, itemId, 1)) {
      return {
        success: false,
        inventory,
        equipment,
        reason: `Item not in inventory.`,
      };
    }

    const slot = def.slot!;
    const previousItemId = equipment[slot];

    // 1. Remove 1 of the new item from inventory
    const removeRes = InventoryManager.removeItem(inventory, itemId, 1);
    if (!removeRes.success) {
      return { success: false, inventory, equipment, reason: removeRes.reason };
    }
    let nextInventory = removeRes.inventory;

    // 2. If slot had an existing item, put it back into inventory
    if (previousItemId) {
      const addRes = InventoryManager.addItem(nextInventory, previousItemId, 1);
      if (!addRes.success) {
        // Rollback
        return {
          success: false,
          inventory,
          equipment,
          reason:
            addRes.reason ||
            "Could not return previous equipment to inventory.",
        };
      }
      nextInventory = addRes.inventory;
    }

    // 3. Update equipment slot
    const nextEquipment: EntityEquipment = {
      ...equipment,
      [slot]: itemId,
    };

    return {
      success: true,
      inventory: nextInventory,
      equipment: nextEquipment,
      swappedItemId: previousItemId ?? null,
    };
  }

  /**
   * Unequips an item from an equipment slot and returns it to inventory.
   */
  public static unequipItem(
    inventory: InventoryState,
    equipment: EntityEquipment,
    slot: EquipmentSlot
  ): {
    success: boolean;
    inventory: InventoryState;
    equipment: EntityEquipment;
    unequippedItemId?: string | null;
    reason?: string;
  } {
    const currentItemId = equipment[slot];
    if (!currentItemId) {
      return {
        success: false,
        inventory,
        equipment,
        reason: `No item equipped in ${slot} slot.`,
      };
    }

    // Try adding the item into inventory
    const addRes = InventoryManager.addItem(inventory, currentItemId, 1);
    if (!addRes.success) {
      return {
        success: false,
        inventory,
        equipment,
        reason: addRes.reason || "Inventory is full! Cannot unequip item.",
      };
    }

    const nextEquipment: EntityEquipment = {
      ...equipment,
      [slot]: null,
    };

    return {
      success: true,
      inventory: addRes.inventory,
      equipment: nextEquipment,
      unequippedItemId: currentItemId,
    };
  }
}
