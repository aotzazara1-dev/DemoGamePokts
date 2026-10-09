# Issue 01: Core Progression Engine, EXP Formulas & Stat Allocation

Status: ready
Blocked by:

## Objective
Implement mathematical EXP curves, level-up threshold calculations, combatant EXP awards, and stat point allocation mechanics with 100% test coverage in `@poktsonline/shared`.

## Tasks
1. Update `Combatant` interface in `packages/shared/src/types.ts` with `exp`, `maxExp`, and `statPoints`.
2. Update `RosterManager.createInitialRoster()` and `Combatant` fixtures with initial progression fields (Hero: Lv.5, 0/559 EXP, 0 stat points; Aqua Fin: Lv.4, 0/400 EXP, 0 stat points).
3. Create `packages/shared/src/progression/progression-engine.ts`:
   - `calculateExpToNextLevel(level: number): number`
   - `calculateEnemyExpReward(level: number): number`
   - `addExpToCombatant(combatant: Combatant, expAmount: number): { combatant: Combatant; leveledUp: boolean; levelsGained: number; statPointsGained: number }`
   - `allocateStatPoint(combatant: Combatant, attribute: 'atk' | 'def' | 'int' | 'agi'): { success: boolean; combatant: Combatant; reason?: string }`
4. Add unit test suite `packages/shared/test/progression.test.ts` testing all formulas, level up overflow, stat caps, and negative constraints.
