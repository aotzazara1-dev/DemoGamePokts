import { InventoryState, WarehouseState, ItemStack } from "../types.js";
import { getItemDefinition } from "./item-database.js";
import { InventoryManager } from "./inventory-manager.js";

export interface WarehouseItemResult {
  success: boolean;
  inventory: InventoryState;
  warehouse: WarehouseState;
  transferredQuantity?: number;
  reason?: string;
}

export interface WarehouseGoldResult {
  success: boolean;
  inventory: InventoryState;
  warehouse: WarehouseState;
  transferredGold?: number;
  reason?: string;
}

/**
 * Domain manager for Personal Item & Gold Warehouse storage (ADR 0022).
 * Strictly <= 400 lines (Anti-God-Files ADR 0020).
 */
export class WarehouseManager {
  public static readonly WAREHOUSE_CAPACITY = 40;

  /**
   * Initializes a fresh 40-slot WarehouseState with 0 stored Gold.
   */
  public static createInitialWarehouse(): WarehouseState {
    const slots: (ItemStack | null)[] = new Array(this.WAREHOUSE_CAPACITY).fill(
      null
    );
    return {
      slots,
      gold: 0,
    };
  }

  /**
   * Guarantees warehouse state validity (40 slots array, valid gold number).
   */
  public static ensureWarehouseState(
    warehouse?: Partial<WarehouseState> | null
  ): WarehouseState {
    if (!warehouse) return this.createInitialWarehouse();

    const rawSlots = warehouse.slots || [];
    const slots: (ItemStack | null)[] = new Array(this.WAREHOUSE_CAPACITY).fill(
      null
    );
    for (let i = 0; i < this.WAREHOUSE_CAPACITY; i++) {
      if (rawSlots[i]) {
        slots[i] = {
          itemId: rawSlots[i]!.itemId,
          quantity: Math.max(1, Math.floor(rawSlots[i]!.quantity || 1)),
        };
      }
    }

    return {
      slots,
      gold: Math.max(0, Math.floor(warehouse.gold || 0)),
    };
  }

  /**
   * Deposits an item stack (or partial stack) from the inventory into the warehouse.
   */
  public static depositItem(
    inventory: InventoryState,
    warehouse: WarehouseState,
    inventorySlotIndex: number,
    quantity?: number
  ): WarehouseItemResult {
    const safeInv = {
      slots: inventory.slots.map((s) => (s ? { ...s } : null)),
      gold: inventory.gold,
    };
    const safeWh = {
      slots: warehouse.slots.map((s) => (s ? { ...s } : null)),
      gold: warehouse.gold,
    };

    if (inventorySlotIndex < 0 || inventorySlotIndex >= safeInv.slots.length) {
      return {
        success: false,
        inventory,
        warehouse,
        reason: "ตำแหน่งช่องในกระเป๋าไม่ถูกต้อง",
      };
    }

    const item = safeInv.slots[inventorySlotIndex];
    if (!item || item.quantity <= 0) {
      return {
        success: false,
        inventory,
        warehouse,
        reason: "ไม่มีไอเทมในช่องกระเป๋านี้",
      };
    }

    const def = getItemDefinition(item.itemId);
    const stackMax = def?.stackMax || 99;
    const transferQty =
      quantity !== undefined
        ? Math.min(quantity, item.quantity)
        : item.quantity;

    if (transferQty <= 0) {
      return {
        success: false,
        inventory,
        warehouse,
        reason: "จำนวนที่ต้องการฝากต้องมากกว่า 0",
      };
    }

    // Try stacking onto existing matching warehouse slots first
    let remainingToDeposit = transferQty;
    for (
      let i = 0;
      i < this.WAREHOUSE_CAPACITY && remainingToDeposit > 0;
      i++
    ) {
      const whSlot = safeWh.slots[i];
      if (
        whSlot &&
        whSlot.itemId === item.itemId &&
        whSlot.quantity < stackMax
      ) {
        const canTake = stackMax - whSlot.quantity;
        const taking = Math.min(canTake, remainingToDeposit);
        whSlot.quantity += taking;
        remainingToDeposit -= taking;
      }
    }

    // Put remaining into first available empty slots
    while (remainingToDeposit > 0) {
      const emptyIdx = safeWh.slots.findIndex((s) => s === null);
      if (emptyIdx === -1) {
        // Warehouse full and cannot fit remaining
        const actualTransferred = transferQty - remainingToDeposit;
        if (actualTransferred > 0) {
          // Partial transfer succeeded
          item.quantity -= actualTransferred;
          if (item.quantity <= 0) {
            safeInv.slots[inventorySlotIndex] = null;
          }
          return {
            success: true,
            inventory: safeInv,
            warehouse: safeWh,
            transferredQuantity: actualTransferred,
          };
        }
        return {
          success: false,
          inventory,
          warehouse,
          reason: "คลังเก็บของเต็มแล้ว",
        };
      }

      const putting = Math.min(stackMax, remainingToDeposit);
      safeWh.slots[emptyIdx] = {
        itemId: item.itemId,
        quantity: putting,
      };
      remainingToDeposit -= putting;
    }

    // Deduct transferred from inventory slot
    item.quantity -= transferQty;
    if (item.quantity <= 0) {
      safeInv.slots[inventorySlotIndex] = null;
    }

    return {
      success: true,
      inventory: safeInv,
      warehouse: safeWh,
      transferredQuantity: transferQty,
    };
  }

  /**
   * Withdraws an item stack (or partial stack) from the warehouse into the inventory.
   */
  public static withdrawItem(
    inventory: InventoryState,
    warehouse: WarehouseState,
    warehouseSlotIndex: number,
    quantity?: number
  ): WarehouseItemResult {
    const safeInv = {
      slots: inventory.slots.map((s) => (s ? { ...s } : null)),
      gold: inventory.gold,
    };
    const safeWh = {
      slots: warehouse.slots.map((s) => (s ? { ...s } : null)),
      gold: warehouse.gold,
    };

    if (
      warehouseSlotIndex < 0 ||
      warehouseSlotIndex >= this.WAREHOUSE_CAPACITY
    ) {
      return {
        success: false,
        inventory,
        warehouse,
        reason: "ตำแหน่งช่องในคลังไม่ถูกต้อง",
      };
    }

    const whItem = safeWh.slots[warehouseSlotIndex];
    if (!whItem || whItem.quantity <= 0) {
      return {
        success: false,
        inventory,
        warehouse,
        reason: "ไม่มีไอเทมในช่องคลังนี้",
      };
    }

    const transferQty =
      quantity !== undefined
        ? Math.min(quantity, whItem.quantity)
        : whItem.quantity;
    if (transferQty <= 0) {
      return {
        success: false,
        inventory,
        warehouse,
        reason: "จำนวนที่ต้องการถอนต้องมากกว่า 0",
      };
    }

    // Use InventoryManager.addItem to place into inventory
    const addRes = InventoryManager.addItem(
      safeInv,
      whItem.itemId,
      transferQty
    );
    if (!addRes.success) {
      return {
        success: false,
        inventory,
        warehouse,
        reason: addRes.reason || "กระเป๋าของคุณเต็มแล้ว",
      };
    }

    // Deduct from warehouse
    whItem.quantity -= transferQty;
    if (whItem.quantity <= 0) {
      safeWh.slots[warehouseSlotIndex] = null;
    }

    return {
      success: true,
      inventory: addRes.inventory,
      warehouse: safeWh,
      transferredQuantity: transferQty,
    };
  }

  /**
   * Deposits gold currency from inventory into warehouse storage.
   */
  public static depositGold(
    inventory: InventoryState,
    warehouse: WarehouseState,
    amount: number
  ): WarehouseGoldResult {
    const safeAmount = Math.floor(amount);
    if (safeAmount <= 0) {
      return {
        success: false,
        inventory,
        warehouse,
        reason: "จำนวนทองที่ต้องการฝากต้องมากกว่า 0",
      };
    }

    if (inventory.gold < safeAmount) {
      return {
        success: false,
        inventory,
        warehouse,
        reason: "คุณมีเหรียญทองในตัวไม่เพียงพอ",
      };
    }

    return {
      success: true,
      inventory: {
        ...inventory,
        gold: inventory.gold - safeAmount,
      },
      warehouse: {
        ...warehouse,
        gold: warehouse.gold + safeAmount,
      },
      transferredGold: safeAmount,
    };
  }

  /**
   * Withdraws stored gold from warehouse back into inventory.
   */
  public static withdrawGold(
    inventory: InventoryState,
    warehouse: WarehouseState,
    amount: number
  ): WarehouseGoldResult {
    const safeAmount = Math.floor(amount);
    if (safeAmount <= 0) {
      return {
        success: false,
        inventory,
        warehouse,
        reason: "จำนวนทองที่ต้องการถอนต้องมากกว่า 0",
      };
    }

    if (warehouse.gold < safeAmount) {
      return {
        success: false,
        inventory,
        warehouse,
        reason: "เหรียญทองในคลังมีไม่เพียงพอ",
      };
    }

    return {
      success: true,
      inventory: {
        ...inventory,
        gold: inventory.gold + safeAmount,
      },
      warehouse: {
        ...warehouse,
        gold: warehouse.gold - safeAmount,
      },
      transferredGold: safeAmount,
    };
  }
}
