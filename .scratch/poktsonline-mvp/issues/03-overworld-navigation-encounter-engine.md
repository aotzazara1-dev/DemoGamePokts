# 03: Overworld Navigation and Encounter Engine

**What to build:** The grid navigation and encounter system that allows a player to move across an isometric 2.5D grid, prevents walking through boundaries and obstacles, and evaluates step-based random wild encounter probabilities inside designated Zones.

**Blocked by:** 01: Scaffold Monorepo and Core Battle Formulas

**Status:** resolved

- [x] `OverworldEngine.movePlayer` accepts current player position, movement direction/target, and map boundaries/collisions, returning validated coordinates.
- [x] Zone definition specifies tile bounding regions and wild encounter rates per step.
- [x] Walking inside wild Zones increments step counters and evaluates deterministic encounter rolls.
- [x] When an encounter triggers, the engine selects wild Beasts and levels from the Zone encounter pool and returns an initial combat configuration.
- [x] Unit test suite in `packages/shared` verifies movement bounds, collision avoidance, and encounter probability triggering.
