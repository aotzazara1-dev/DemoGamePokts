# Issue 04: Client Warehouse and Inn Modal Controllers

## Description

Build the deep UI modal controllers `WarehouseModalController` and `InnStorageModalController`, write responsive styles, and wire into `OverworldScene`.

## Blocking Edges

- Blocked by: `01-shared-warehouse-and-inn-domain-types.md`, `02-server-sqlite-schema-and-persistence.md`, `03-npc-innkeeper-dialogue-and-overworld-integration.md`

## Tasks

- [x] In `packages/client/index.html`:
  - Add markup for `#warehouse-modal` (Side-by-side dual grid: Inventory vs Warehouse).
  - Add markup for `#inn-storage-modal` (Side-by-side dual grid: Roster vs Inn Storage).
- [x] In `packages/client/src/ui/WarehouseModalController.ts`:
  - Deep UI module strictly <= 400 LOC.
  - Render 20-slot backpack and 40-slot warehouse.
  - Gold deposit/withdraw dialogs.
  - Transfer actions with toasts.
- [x] In `packages/client/src/ui/InnStorageModalController.ts`:
  - Deep UI module strictly <= 400 LOC.
  - Render active roster and 30-capacity inn storage.
  - Deposit/withdraw actions with full-heal feedback and active beast protection.
- [x] In `packages/client/src/styles/warehouse-modal.css` and `inn-storage-modal.css`:
  - Clean modular CSS with responsive dual-grid cards, slots, and badges.
- [x] In `packages/client/src/scenes/OverworldScene.ts`:
  - Instantiate `WarehouseModalController` and `InnStorageModalController`.
  - Wire to `dialogueModal` callbacks.
  - Maintain Boy Scout Rule: `OverworldScene.ts` must stay <= 1901 LOC.
- [x] Write client unit tests in `packages/client/test/warehouse-inn-ui.test.ts`.

## Verification

- `npm run check:god-files` passes without warning.
- `npm run check` passes completely.
