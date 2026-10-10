# Issue 03: NPC Innkeeper Dialogue and Overworld Integration

## Description

Place Innkeeper Göll (`npc_goll`) in Novice Town, configure dialogue options for Warehouse and Inn Storage, and wire dialogue callbacks.

## Blocking Edges

- Blocked by: `01-shared-warehouse-and-inn-domain-types.md`

## Tasks

- [x] In `packages/shared/src/overworld/map-database.ts`:
  - Add `npc_goll` to `novice_town_and_meadow` NPCs list at `{ x: 10, y: 7 }`.
  - Configure options for `opt_warehouse` (action: `'warehouse'`), `opt_inn_beasts` (action: `'inn_beasts'`), and `opt_close`.
- [x] In `packages/client/src/ui/DialogueModalController.ts`:
  - Update `DialogueModalCallbacks` with `onOpenWarehouse?: (npc: NPCDefinition) => void` and `onOpenInnStorage?: (npc: NPCDefinition) => void`.
  - Handle `'warehouse'` and `'inn_beasts'` action clicks.
- [x] Write unit tests for dialogue action handling in `packages/client/test/dialogue-warehouse-actions.test.ts`.

## Verification

- Clicking Innkeeper Göll options triggers respective modal open callbacks.
- All tests pass.
