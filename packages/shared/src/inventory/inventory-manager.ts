import { InventoryState, ItemStack, Combatant } from "../types.js";
import { getItemDefinition } from "./item-database.js";
import { SkillManager } from "../skills/skill-manager.js";

export class InventoryManager {
  public static readonly INVENTORY_CAPACITY = 20;

  /**
   * Initializes a fresh 20-slot InventoryState with starter rations and 200 Gold.
   */
  public static createInitialInventory(): InventoryState {
    const slots: (ItemStack | null)[] = new Array(this.INVENTORY_CAPACITY).fill(
      null
    );
    slots[0] = { itemId: "item_steamed_bun", quantity: 5 };
    slots[1] = { itemId: "item_herbal_tea", quantity: 3 };
    slots[2] = { itemId: "item_phoenix_feather", quantity: 1 };

    return {
      slots,
      gold: 200,
    };
  }

  /**
   * Checks if the inventory contains at least `quantity` of `itemId`.
   */
  public static hasItem(
    inventory: InventoryState,
    itemId: string,
    quantity: number = 1
  ): boolean {
    const total = inventory.slots.reduce((acc, slot) => {
      if (slot && slot.itemId === itemId) return acc + slot.quantity;
      return acc;
    }, 0);
    return total >= quantity;
  }

  /**
   * Adds `quantity` of `itemId` to the inventory, stacking on existing slots first.
   */
  public static addItem(
    inventory: InventoryState,
    itemId: string,
    quantity: number
  ): { success: boolean; inventory: InventoryState; reason?: string } {
    if (quantity <= 0) return { success: true, inventory };

    const def = getItemDefinition(itemId);
    if (!def) {
      return {
        success: false,
        inventory,
        reason: `Unknown item ID: ${itemId}`,
      };
    }

    const newSlots = inventory.slots.map((s) => (s ? { ...s } : null));
    let remaining = quantity;

    // 1. Try filling existing stacks
    for (let i = 0; i < newSlots.length && remaining > 0; i++) {
      const slot = newSlots[i];
      if (slot && slot.itemId === itemId && slot.quantity < def.stackMax) {
        const available = def.stackMax - slot.quantity;
        const addAmount = Math.min(available, remaining);
        slot.quantity += addAmount;
        remaining -= addAmount;
      }
    }

    // 2. Put remaining in empty slots
    for (let i = 0; i < newSlots.length && remaining > 0; i++) {
      if (newSlots[i] === null) {
        const addAmount = Math.min(def.stackMax, remaining);
        newSlots[i] = { itemId, quantity: addAmount };
        remaining -= addAmount;
      }
    }

    if (remaining > 0) {
      return {
        success: false,
        inventory,
        reason: "Inventory is full! Could not store all items.",
      };
    }

    return {
      success: true,
      inventory: {
        ...inventory,
        slots: newSlots,
      },
    };
  }

  /**
   * Deducts `quantity` of `itemId` from the inventory across slots.
   */
  public static removeItem(
    inventory: InventoryState,
    itemId: string,
    quantity: number
  ): { success: boolean; inventory: InventoryState; reason?: string } {
    if (quantity <= 0) return { success: true, inventory };

    if (!this.hasItem(inventory, itemId, quantity)) {
      return {
        success: false,
        inventory,
        reason: "Not enough items in inventory.",
      };
    }

    const newSlots = inventory.slots.map((s) => (s ? { ...s } : null));
    let needed = quantity;

    for (let i = 0; i < newSlots.length && needed > 0; i++) {
      const slot = newSlots[i];
      if (slot && slot.itemId === itemId) {
        if (slot.quantity <= needed) {
          needed -= slot.quantity;
          newSlots[i] = null;
        } else {
          slot.quantity -= needed;
          needed = 0;
        }
      }
    }

    return {
      success: true,
      inventory: {
        ...inventory,
        slots: newSlots,
      },
    };
  }

  /**
   * Applies an item effect to a target combatant (Hero or Beast) and consumes 1 item from inventory.
   */
  public static useItemOnCombatant(
    inventory: InventoryState,
    itemId: string,
    target: Combatant,
    inCombat: boolean = false,
    targetSlotIndex?: number
  ): {
    success: boolean;
    inventory: InventoryState;
    target: Combatant;
    message: string;
    reason?: string;
  } {
    const def = getItemDefinition(itemId);
    if (!def) {
      return {
        success: false,
        inventory,
        target,
        message: "",
        reason: "Unknown item.",
      };
    }

    if (inCombat && !def.usableInCombat) {
      return {
        success: false,
        inventory,
        target,
        message: "",
        reason: `${def.name} cannot be used in combat.`,
      };
    }

    if (!inCombat && !def.usableOnOverworld) {
      return {
        success: false,
        inventory,
        target,
        message: "",
        reason: `${def.name} cannot be used outside combat.`,
      };
    }

    if (!this.hasItem(inventory, itemId, 1)) {
      return {
        success: false,
        inventory,
        target,
        message: "",
        reason: `You don't have any ${def.name}.`,
      };
    }

    const updatedTarget: Combatant = { ...target };
    let message = "";

    switch (def.type) {
      case "hp_restore": {
        if (updatedTarget.hp <= 0) {
          return {
            success: false,
            inventory,
            target,
            message: "",
            reason: `${updatedTarget.name} has fallen and cannot eat!`,
          };
        }
        if (updatedTarget.hp >= updatedTarget.maxHp) {
          return {
            success: false,
            inventory,
            target,
            message: "",
            reason: `${updatedTarget.name} is already at full HP.`,
          };
        }
        const healed = Math.min(
          def.effectValue,
          updatedTarget.maxHp - updatedTarget.hp
        );
        updatedTarget.hp += healed;
        message = `${updatedTarget.name} used ${def.name} and recovered ${healed} HP! (${updatedTarget.hp}/${updatedTarget.maxHp})`;
        break;
      }

      case "sp_restore": {
        if (updatedTarget.hp <= 0) {
          return {
            success: false,
            inventory,
            target,
            message: "",
            reason: `${updatedTarget.name} has fallen and cannot drink!`,
          };
        }
        if (updatedTarget.sp >= updatedTarget.maxSp) {
          return {
            success: false,
            inventory,
            target,
            message: "",
            reason: `${updatedTarget.name} is already at full SP.`,
          };
        }
        const restored = Math.min(
          def.effectValue,
          updatedTarget.maxSp - updatedTarget.sp
        );
        updatedTarget.sp += restored;
        message = `${updatedTarget.name} drank ${def.name} and recovered ${restored} SP! (${updatedTarget.sp}/${updatedTarget.maxSp})`;
        break;
      }

      case "revive": {
        if (updatedTarget.hp > 0) {
          return {
            success: false,
            inventory,
            target,
            message: "",
            reason: `${updatedTarget.name} is not fainted.`,
          };
        }
        const revivedHp = Math.min(def.effectValue, updatedTarget.maxHp);
        updatedTarget.hp = revivedHp;
        message = `${updatedTarget.name} was revived with ${revivedHp} HP by ${def.name}!`;
        break;
      }

      case "scroll": {
        if (def.skillId) {
          const learnRes = SkillManager.learnSkill(
            updatedTarget,
            def.skillId,
            targetSlotIndex
          );
          if (!learnRes.success) {
            return {
              success: false,
              inventory,
              target,
              message: "",
              reason: learnRes.reason || `Failed to learn ${def.name}.`,
            };
          }
          message =
            learnRes.message ||
            `${updatedTarget.name} learned a new skill from ${def.name}!`;
          break;
        }
        message = `${updatedTarget.name} activated ${def.name}!`;
        break;
      }

      default:
        return {
          success: false,
          inventory,
          target,
          message: "",
          reason: "Unsupported item type.",
        };
    }

    // Consume 1 item
    const removeRes = this.removeItem(inventory, itemId, 1);

    return {
      success: true,
      inventory: removeRes.inventory,
      target: updatedTarget,
      message,
    };
  }

  /**
   * Adds or subtracts gold.
   */
  public static addGold(
    inventory: InventoryState,
    amount: number
  ): InventoryState {
    return {
      ...inventory,
      gold: Math.max(0, inventory.gold + amount),
    };
  }
}
