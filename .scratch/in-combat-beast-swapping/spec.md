# Specification: In-Combat Beast Swapping (ADR 0011)

## 1. Overview & Objective

This specification formalizes the in-combat Companion Swapping system for _Poktsonline_, enabling Heroes to dynamically withdraw their deployed Active Beast and summon a conscious Reserve Beast from their Roster during the Action Phase of a Battle Instance.

---

## 2. Domain Rules & Mechanics

### 2.1 Action Cost & Initiator

- Only the **Hero** can initiate a Swap command (`type: 'swap'`).
- Using Swap consumes the Hero's action for the current round.
- The currently deployed Beast (if alive) does not execute any command during that round.

### 2.2 Formation Placement & Inheritance

- The newly deployed Reserve Beast occupies the exact Formation Grid coordinate (`{ row, col }`) previously held by the outgoing Active Beast.
- If the previous Active Beast was already defeated (HP = 0), the slot is empty, and the incoming Beast fills that empty slot.

### 2.3 Turn Resolution Sequence

- During the Resolution Phase, when the Hero's turn occurs according to their AGI:
  1. The outgoing Active Beast (if any) is withdrawn from the Formation Grid.
  2. The incoming Reserve Beast is deployed onto the Formation Grid.
  3. A `'swap'` BattleEvent is produced:
     ```ts
     {
       type: 'swap',
       actorId: hero.id,
       targetId: newBeast.id,
       message: `${hero.name} withdrew ${oldBeastName} and summoned ${newBeast.name}!`
     }
     ```
  4. The newly deployed Reserve Beast does not execute any attack or skill on the round it is summoned; it can be given commands on the subsequent round.

### 2.4 Eligibility Criteria

- The target Beast must exist in the Hero's Roster (`roster.beasts`).
- The target Beast must not already be deployed on the Formation Grid.
- The target Beast must be conscious (`hp > 0`). Beasts with `hp === 0` cannot be deployed.
- Beasts stored in Inn Storage are inaccessible during combat.

### 2.5 Roster Synchronization & Post-Battle Persistence

- When a Beast is swapped in, `roster.activeBeastId` is updated to the newly deployed Beast's ID.
- Any HP and SP changes sustained during combat are preserved in the Roster when concluding the Battle Instance and returning to the Overworld.

---

## 3. Architecture & Anti-God-Files Guardrails (ADR 0020)

- `packages/shared/src/battle/battle-swap-executor.ts`: Deep executor module keeping `battle-engine.ts` <= 400 LOC.
- `packages/client/src/ui/BattleSwapMenuController.ts`: Deep UI controller encapsulating DOM modal/cards for reserve beast selection, keeping `BattleScene.ts` <= 1,290 LOC.
- `packages/client/src/styles/battle-swap-menu.css`: Modular styling for the swap UI.
