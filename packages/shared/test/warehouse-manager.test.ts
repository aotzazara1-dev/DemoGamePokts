import { describe, it, expect, beforeEach } from "vitest";
import { WarehouseManager } from "../src/inventory/warehouse-manager.js";
import { InventoryManager } from "../src/inventory/inventory-manager.js";
import { InventoryState, WarehouseState } from "../src/types.js";

describe("WarehouseManager", () => {
  let inventory: InventoryState;
  let warehouse: WarehouseState;

  beforeEach(() => {
    inventory = InventoryManager.createInitialInventory();
    warehouse = WarehouseManager.createInitialWarehouse();
  });

  it("should initialize warehouse with 40 empty slots and 0 gold", () => {
    expect(warehouse.slots.length).toBe(40);
    expect(warehouse.slots.every((s) => s === null)).toBe(true);
    expect(warehouse.gold).toBe(0);
  });

  it("should deposit an item from inventory into warehouse", () => {
    // Initial inventory slot 0 has 5 steamed buns
    const res = WarehouseManager.depositItem(inventory, warehouse, 0, 3);
    expect(res.success).toBe(true);
    expect(res.transferredQuantity).toBe(3);

    // Inventory now has 2 buns
    expect(res.inventory.slots[0]?.quantity).toBe(2);
    // Warehouse has 3 buns at slot 0
    expect(res.warehouse.slots[0]?.itemId).toBe("item_steamed_bun");
    expect(res.warehouse.slots[0]?.quantity).toBe(3);
  });

  it("should clear inventory slot when entire stack is deposited", () => {
    const res = WarehouseManager.depositItem(inventory, warehouse, 0, 5);
    expect(res.success).toBe(true);
    expect(res.inventory.slots[0]).toBeNull();
    expect(res.warehouse.slots[0]?.quantity).toBe(5);
  });

  it("should stack onto existing items in warehouse", () => {
    // First deposit 3 buns
    let res = WarehouseManager.depositItem(inventory, warehouse, 0, 3);
    expect(res.success).toBe(true);

    // Deposit 2 more buns
    res = WarehouseManager.depositItem(res.inventory, res.warehouse, 0, 2);
    expect(res.success).toBe(true);

    // Should stack into warehouse slot 0 (quantity 5)
    expect(res.warehouse.slots[0]?.quantity).toBe(5);
    expect(res.warehouse.slots[1]).toBeNull();
  });

  it("should withdraw item from warehouse back into inventory", () => {
    // Deposit 5 buns
    let res = WarehouseManager.depositItem(inventory, warehouse, 0, 5);
    expect(res.success).toBe(true);

    // Withdraw 2 buns
    const withdrawRes = WarehouseManager.withdrawItem(
      res.inventory,
      res.warehouse,
      0,
      2
    );
    expect(withdrawRes.success).toBe(true);
    expect(withdrawRes.transferredQuantity).toBe(2);

    expect(withdrawRes.warehouse.slots[0]?.quantity).toBe(3);
    // Inventory buns increased by 2
    const invBuns = withdrawRes.inventory.slots.find(
      (s) => s?.itemId === "item_steamed_bun"
    );
    expect(invBuns?.quantity).toBe(2);
  });

  it("should deposit and withdraw gold accurately", () => {
    // Initial inventory gold = 200
    const depRes = WarehouseManager.depositGold(inventory, warehouse, 150);
    expect(depRes.success).toBe(true);
    expect(depRes.inventory.gold).toBe(50);
    expect(depRes.warehouse.gold).toBe(150);

    // Reject depositing more gold than owned
    const failDep = WarehouseManager.depositGold(
      depRes.inventory,
      depRes.warehouse,
      100
    );
    expect(failDep.success).toBe(false);

    // Withdraw 100 gold from warehouse
    const withRes = WarehouseManager.withdrawGold(
      depRes.inventory,
      depRes.warehouse,
      100
    );
    expect(withRes.success).toBe(true);
    expect(withRes.inventory.gold).toBe(150);
    expect(withRes.warehouse.gold).toBe(50);

    // Reject withdrawing more gold than stored
    const failWith = WarehouseManager.withdrawGold(
      withRes.inventory,
      withRes.warehouse,
      999
    );
    expect(failWith.success).toBe(false);
  });
});
