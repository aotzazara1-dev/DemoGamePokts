# 01-shared-roaming-beast-types
Status: resolved
Blocked by: none

## Description
Add shared data contracts and types for Roaming Beasts in `@poktsonline/shared`.
- Define `RoamingBeastEntity` interface in `packages/shared/src/types.ts`.
- Add helper functions to generate initial roaming beasts from `MapConfig` wild zones.
- Export all types and helper functions through `packages/shared/src/index.ts`.
- Add unit tests in `packages/shared/test/roaming-beast.test.ts`.

## Answer
Implemented `RoamingBeastEntity` in `packages/shared/src/types.ts` and `RoamingBeastManager` in `packages/shared/src/overworld/roaming-beast-manager.ts` with helper methods for map beast generation, combatant conversion, and AI stepping. All 97 shared tests pass.
