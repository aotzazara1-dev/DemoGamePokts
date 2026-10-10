# Issue 03: Server Persistence and Hero State

## Description

Persist `skill_points`, `unlocked_skill_ids`, and `skill_slots` in the server SQLite database so skill tree progression and equipped slots survive server restarts and re-logins.

## Tasks

- [ ] In `packages/server/src/db/DatabaseEngine.ts`:
  - Run migrations to add `skill_points` (INTEGER DEFAULT 0) and `unlocked_skill_ids` (TEXT DEFAULT '[]') to `heroes` table if not present.
- [ ] In `packages/server/src/db/HeroRepository.ts`:
  - Update `getHeroFullState` to load `skillPoints`, `unlockedSkillIds`, and `skillSlots`.
  - Update `saveHeroState` to persist `skill_points`, `unlocked_skill_ids`, and `skill_slots`.
  - Keep `HeroRepository.ts` strictly <= 482 lines (whitelist cap).
- [ ] In `packages/shared/src/auth/types.ts`:
  - Ensure `HeroFullSaveState` or combatant properties carry `skillPoints` and `unlockedSkillIds`.
- [ ] Write unit tests in `packages/server/test/hero-skill-tree-persistence.test.ts`.

## Verification

- `npm run test -w @poktsonline/server` passes.
- `npm run check:god-files` passes.
