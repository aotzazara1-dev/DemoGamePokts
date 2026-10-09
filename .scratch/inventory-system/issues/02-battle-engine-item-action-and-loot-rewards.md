# Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards

## Description
Connect item usage to `BattleEngine` turn resolution with ally/self targeting, and wire `BattleRoom` to calculate and emit monster drop rewards (Gold & items) upon victory.

## Tasks
1. Update `packages/shared/src/battle/battle-engine.ts` to process `actor.action.itemId` and target combatant (healing HP, SP, or reviving).
2. Update `packages/server/src/rooms/BattleRoom.ts` on combat victory to calculate `loot: { gold: number, droppedItems: ItemStack[] }` and include it in battle conclusion payload.
3. Add unit test in `packages/shared/test/battle-engine.test.ts` for item execution.
4. Add integration test in `packages/server/test/battle-room.test.ts` verifying loot is awarded upon victory.

## Verification
- Run `npm test` across all workspaces.
