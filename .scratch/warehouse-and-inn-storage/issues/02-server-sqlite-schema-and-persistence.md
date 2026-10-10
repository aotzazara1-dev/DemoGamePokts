# Issue 02: Server SQLite Schema and Persistence

## Description

Extend the SQLite database schema on `heroes` table to persist `warehouse_items`, `warehouse_gold`, and `inn_beasts`, update `HeroRepository`, and wire client-server state synchronization.

## Blocking Edges

- Blocked by: `01-shared-warehouse-and-inn-domain-types.md`

## Tasks

- [x] In `packages/server/src/db/DatabaseEngine.ts`:
  - Add migration columns: `warehouse_items` (TEXT DEFAULT '[]'), `warehouse_gold` (INTEGER DEFAULT 0), and `inn_beasts` (TEXT DEFAULT '[]') to `heroes` table.
- [x] In `packages/server/src/db/HeroRepository.ts`:
  - Update `getHeroFullState` to load and parse `warehouse` and `innStorage`.
  - Update `saveHeroState` to serialize and update `warehouse_items`, `warehouse_gold`, and `inn_beasts`.
  - Maintain Boy Scout Rule: `HeroRepository.ts` must stay <= 482 lines.
- [x] In `packages/shared/src/auth/types.ts`:
  - Update `HeroFullSaveState` and `SyncHeroStatePayload` to include `warehouse?: WarehouseState` and `innStorage?: InnStorageState`.
- [x] Write integration test in `packages/server/test/warehouse-inn-persistence.test.ts`.

## Verification

- `npm run test -w @poktsonline/server` passes.
- `npm run check:god-files` passes.
