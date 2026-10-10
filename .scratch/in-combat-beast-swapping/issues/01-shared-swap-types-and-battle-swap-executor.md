# Ticket 01: Shared Swap Types and BattleSwapExecutor

Status: Completed

## Description

Add `'swap'` to `CombatActionType` and `swapBeastId?: string` to `CombatAction`.
Implement `BattleSwapExecutor` in `packages/shared/src/battle/battle-swap-executor.ts` and integrate into `BattleEngine.resolveTurn` while keeping `battle-engine.ts` <= 400 LOC.

## Requirements

1. Update `packages/shared/src/types.ts`:
   - `CombatActionType`: include `"swap"`.
   - `CombatAction`: include `swapBeastId?: string`.
2. Create `packages/shared/src/battle/battle-swap-executor.ts`:
   - Validates Hero ownership of swap action.
   - Finds candidate beast in `alliesRoster` or reserve beasts pool.
   - Replaces deployed beast in Formation Grid (front or back row).
   - Generates `'swap'` event and sets acted status for incoming unit.
3. Wire into `BattleEngine.resolveTurn`:
   - Call `BattleSwapExecutor.executeSwap` during Hero's action turn.
   - Ensure `battle-engine.ts` line count does NOT exceed 400.
4. Unit Tests in `packages/shared/test/battle-swap.test.ts`:
   - Successful swap replaces beast on grid and emits event.
   - Failed swap when actor is not Hero.
   - Failed swap when target beast has hp = 0.
   - Failed swap when target beast is already deployed.
