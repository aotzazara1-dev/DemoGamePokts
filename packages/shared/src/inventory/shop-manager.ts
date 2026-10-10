import { InventoryState } from "../types.js";
import { getItemDefinition } from "./item-database.js";
import { InventoryManager } from "./inventory-manager.js";

/**
 * Deep module for Shopkeeper merchant transactions (ADR 0020).
 * Handles purchasing and selling items with gold validation and inventory slot updates.
 */
export class ShopManager {
  /**
   * Purchases `quantity` of `itemId`, deducting total cost in Gold and adding to inventory slots.
   */
  public static buyItem(
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
        reason: "Item does not exist in database.",
      };
    }

    const totalCost = def.price * quantity;
    if (inventory.gold < totalCost) {
      return {
        success: false,
        inventory,
        reason: `Not enough gold! Required: ${totalCost} G, available: ${inventory.gold} G.`,
      };
    }

    const addRes = InventoryManager.addItem(inventory, itemId, quantity);
    if (!addRes.success) {
      return {
        success: false,
        inventory,
        reason: addRes.reason || "Inventory is full!",
      };
    }

    return {
      success: true,
      inventory: {
        ...addRes.inventory,
        gold: addRes.inventory.gold - totalCost,
      },
    };
  }

  /**
   * Sells `quantity` of items from `slotIndex`, removing items and awarding Gold.
   */
  public static sellItem(
    inventory: InventoryState,
    slotIndex: number,
    quantity: number
  ): {
    success: boolean;
    inventory: InventoryState;
    goldEarned: number;
    reason?: string;
  } {
    if (slotIndex < 0 || slotIndex >= inventory.slots.length) {
      return {
        success: false,
        inventory,
        goldEarned: 0,
        reason: "Invalid slot index.",
      };
    }

    const slot = inventory.slots[slotIndex];
    if (!slot || slot.quantity <= 0) {
      return {
        success: false,
        inventory,
        goldEarned: 0,
        reason: "Selected slot is empty.",
      };
    }

    if (quantity <= 0 || quantity > slot.quantity) {
      return {
        success: false,
        inventory,
        goldEarned: 0,
        reason: `Cannot sell ${quantity} items (slot only contains ${slot.quantity}).`,
      };
    }

    const def = getItemDefinition(slot.itemId);
    const unitPrice = def ? (def.sellPrice ?? Math.floor(def.price / 2)) : 10;
    const goldEarned = unitPrice * quantity;

    const newSlots = inventory.slots.map((s) => (s ? { ...s } : null));
    if (slot.quantity === quantity) {
      newSlots[slotIndex] = null;
    } else {
      newSlots[slotIndex] = {
        ...slot,
        quantity: slot.quantity - quantity,
      };
    }

    return {
      success: true,
      inventory: {
        slots: newSlots,
        gold: inventory.gold + goldEarned,
      },
      goldEarned,
    };
  }
}
