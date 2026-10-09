# 02: Deep BattleEngine and Turn Resolution

**What to build:** The complete, deterministic turn-resolution engine for combat, processing a round of player/enemy choices against a 2x5 Formation Grid, enforcing melee blocking by the Front Row, sorting action execution strictly by AGI, resolving Combos, calculating Capture attempts, and evaluating victory/defeat.

**Blocked by:** 01: Scaffold Monorepo and Core Battle Formulas

**Status:** resolved

- [x] `BattleEngine.resolveTurn` interface accepts current `BattleState` and `TeamActionsMap` and returns a deterministic, stepped log of events and the next state.
- [x] Front Row shields Back Row units from direct melee physical attacks; Back Row units can only be directly targeted if the opposing Front Row slot is vacant or via ranged/skill attacks.
- [x] Turn order resolves in descending order of unit AGI.
- [x] When allied units meet Combo criteria, their attacks combine into a single simultaneous combo event with increased damage (1.5x - 2.0x).
- [x] Defend action reduces incoming damage by 50% for the round.
- [x] Capture action verifies that `Hero.level >= Target.level` and calculates success probability inversely proportional to the target's remaining HP ratio.
- [x] Successful capture immediately removes the wild Beast from the opposing team and registers it into the Hero's captured collection.
- [x] Complete unit test suite verifies all combat invariants, edge cases, and deterministic resolution.
