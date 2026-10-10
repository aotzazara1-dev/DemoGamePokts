# Issue 04: BattleScene Skill Menu Controller and Roster Skill Slots

## Status: closed

## Blocked By: 03-battle-engine-skill-execution.md

## Description

Create `BattleSkillMenuController.ts` in `packages/client/src/ui/` to render the 5 skill slots when "Skill" is clicked in combat without expanding `BattleScene.ts`, respecting ADR 0020 Boy Scout Rule. Also display the 5 skill slots on Champion profiles in Roster modal.

## Tasks

1. Create `packages/client/src/ui/BattleSkillMenuController.ts` (max 300 lines).
2. Wire into `BattleScene.ts` cleanly via delegation.
3. Update `RosterModalController.ts` to display Champion's 5 skill slots.
4. Add client tests and verify `npm run check`.
