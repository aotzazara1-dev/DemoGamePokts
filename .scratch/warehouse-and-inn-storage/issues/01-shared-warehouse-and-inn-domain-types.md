# Issue 01: Shared Warehouse and Inn Domain Types & Managers

## Description

Define the domain types `WarehouseState` and `InnStorageState` in `@poktsonline/shared`, along with pure business logic managers `WarehouseManager` and `InnStorageManager`.

## Tasks

- [x] In `packages/shared/src/types.ts`:
  - Define `WarehouseState` with 40-slot grid `slots: (ItemStack | null)[]` and `gold: number`.
  - Define `InnStorageState` with `beasts: Combatant[]` (max 30).
- [x] In `packages/shared/src/inventory/warehouse-manager.ts`:
  - `createInitialWarehouse(): WarehouseState`
  - `depositItem(...)`
  - `withdrawItem(...)`
  - `depositGold(...)`
  - `withdrawGold(...)`
  - Keep <= 400 LOC ceiling.
- [x] In `packages/shared/src/roster/inn-storage-manager.ts`:
  - `createInitialInnStorage(): InnStorageState`
  - `depositBeast(...)` with full HP/SP restoration and Active Beast check.
  - `withdrawBeast(...)` with 10-roster limit check.
  - Keep <= 400 LOC ceiling.
- [x] Export both managers in `packages/shared/src/index.ts`.
- [x] Write comprehensive unit tests in `packages/shared/test/warehouse-manager.test.ts` and `packages/shared/test/inn-storage-manager.test.ts`.

## Verification

- [x] `npm run test -w @poktsonline/shared` passes.
- [x] `npm run check:god-files` passes.
