# 01: Scaffold Monorepo and Core Battle Formulas

**What to build:** The foundational monorepo workspace containing packages for shared logic, server, and client, along with the core domain data types and pure math calculations for the 6 attributes, 4-element cycle, subtractive damage formula, and combo detection threshold.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Monorepo workspace configuration initializes with `packages/shared`, `packages/server`, and `packages/client`.
- [x] Shared domain types define the 6 Attributes (HP, SP, ATK, DEF, INT, AGI), 4 Elements (Earth, Water, Fire, Wind), and Combat Actions.
- [x] Elemental advantage lookup correctly applies 1.5x on advantage (Earth > Water > Fire > Wind > Earth) and 0.7x on disadvantage.
- [x] Subtractive physical damage formula calculates `Math.max(1, (atk * 2) - def) * elementMultiplier * comboMultiplier`.
- [x] Combo detection logic detects valid triggers when allied units attack the same target with an AGI difference of 15 or less.
- [x] Unit test suite in `packages/shared` passes 100% demonstrating damage math, element tables, and combo detection.
