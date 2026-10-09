# Issue 01: Inventory Domain Model, InventoryManager & LootEngine

## Description
Implement the core item definitions, 20-slot inventory data structures, stack management, consumable item application, and monster loot calculation in `@poktsonline/shared`.

## Tasks
1. Define `ItemDefinition`, `ItemStack`, `InventoryState` in `packages/shared/src/types.ts`.
2. Implement `ITEM_DATABASE` with Steamed Bun, Herbal Tea, Phoenix Feather, and Town Scroll in `packages/shared/src/inventory/item-database.ts`.
3. Implement `InventoryManager` (`createInitialInventory`, `addItem`, `removeItem`, `useItemOnCombatant`) in `packages/shared/src/inventory/inventory-manager.ts`.
4. Implement `LootEngine` (`calculateLootDrop`) in `packages/shared/src/inventory/loot-engine.ts`.
5. Export from `packages/shared/src/index.ts`.
6. Write comprehensive unit tests in `packages/shared/test/inventory.test.ts`.

## Verification
- Run `npm test --workspace=@poktsonline/shared` and verify all tests pass.
