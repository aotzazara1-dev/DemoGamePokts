# ADR 0011: Active Beast Roster and In-Combat Swapping

## Status

Accepted

## Context

In TS Online and classic turn-based MMORPGs, tactical depth relies on elemental advantage and surviving challenging encounters. Players frequently face enemies whose elements counter their currently deployed companion, or whose attacks reduce their companion's HP to critical levels. Without mid-battle companion rotation, combat is rigid and punishes mismatched elemental matchups.

## Decision

We adopt an in-combat Companion Swapping mechanism governed by the following rules:

1. **Hero-Initiated Command (`type: 'swap'`)**:
   - Swapping is an authoritative Combat Action issued by the Hero during the Action Phase.
   - Issuing a Swap consumes the Hero's turn for that round (a tactical trade-off). The withdrawing companion does not act.
2. **Formation Slot Inheritance**:
   - The incoming Reserve Beast immediately assumes the exact Formation Grid slot (row and column) of the withdrawn companion.
3. **Turn Execution & Deployment Order**:
   - The Swap action resolves during the turn resolution phase.
   - The newly deployed Reserve Beast is placed onto the Formation Grid and does not perform offensive or defensive actions during the deployment round; it is eligible for full action selection on the following round.
4. **Fallen Beast Replacement**:
   - If an Active Beast is defeated (HP = 0), the slot remains empty, but the Hero may issue a Swap command on subsequent rounds to deploy a living Reserve Beast into that slot.
5. **Eligibility Criteria**:
   - Only Reserve Beasts present in the Hero's active Roster with `HP > 0` are eligible for deployment. Beasts stored in town Inn Storage cannot be accessed during combat.
6. **Architecture & Decoupling**:
   - Domain logic for turn resolution is isolated in `BattleSwapExecutor` in `@poktsonline/shared` to maintain the 400-LOC ceiling of `BattleEngine.ts` (ADR 0020).
   - In-combat UI is encapsulated in `BattleSwapMenuController` in `@poktsonline/client` to prevent `BattleScene.ts` from exceeding its LOC cap.

## Consequences

- **Positive**: Enables counter-play against unfavorable elemental matchups and preserves hard-earned champions from fainting.
- **Positive**: Adheres strictly to Anti-God-Files guardrails (ADR 0020) by extracting modular executors and UI controllers.
- **Negative**: Adds a menu layer to combat action selection, which is mitigated by clear visual cards showing HP, SP, Level, and Element.
