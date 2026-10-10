# Issue 03: BattleEngine Skill Resolution and Damage Calculation

## Status: closed

## Blocked By: 01-shared-skill-types-and-skill-manager.md

## Description

Integrate skill execution into `BattleEngine.resolveTurn`:

- Deduct SP based on effective cost.
- Apply STAB (+25%) and elemental advantage multiplier.
- Handle heal/buff skills if present.
- Emit formatted battle events and descriptions.

## Tasks

1. Update `BattleEngine` turn resolution for action type `skill`.
2. Unit tests in `packages/shared/test/battle-engine.test.ts`.
