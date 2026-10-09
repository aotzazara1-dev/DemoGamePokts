# Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution

Status: ready
Blocked by: 01

## Objective
Update `BattleRoom` on the server to compute EXP rewards from defeated enemy combatants, distribute them among surviving heroes and active beasts, handle level ups authoritatively, and broadcast results via `battleEnd`.

## Tasks
1. Calculate total EXP from all defeated enemies in `BattleRoom.resolveRoundResolution()`.
2. Apply `addExpToCombatant` to surviving allies.
3. Include `expAwarded`, `alliesProgression`, and `levelUps` in the `battleEnd` broadcast payload.
4. Add integration tests in `packages/server/test/battle-room.test.ts`.
