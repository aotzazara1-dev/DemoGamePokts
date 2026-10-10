# 21. 5-Slot Skill System, Signature Skills, and Elemental Affinity

Date: 2026-10-10

## Status

Accepted

## Context

Combat in Poktsonline follows classic TS Online turn-based rules on a 2x5 Formation Grid.
To introduce deep theory-crafting and tactical creativity inspired by Pokémon and Persona:

1. Every combatant (Hero and Champions) is equipped with a 5-slot skill architecture.
2. Champions possess 1-3 immutable **Signature Skills** (สกิลซิกเนเจอร์) that cannot be overridden, preserving character identity and chase value.
3. Remaining flexible slots can learn extra skills via **Skill Tomes** (`item_tome_*`).
4. To ensure that "Elemental Affinity" remains central and avoid overpowered all-element builds, strict elemental balance rules must be enforced.

## Decision

1. **5 Skill Slots**:
   - `slotIndex: 0..4`.
   - `isSignature: boolean` (locked if true, learnable/forgettable if false).

2. **Elemental Balancing Mechanics**:
   - **STAB (Same-Type Attack Bonus)**: +25% damage modifier when skill element matches combatant element.
   - **Cross-Element Penalty**: -20% damage modifier (0.8x) for off-element skills.
   - **SP Cost Surcharge**: +50% SP required when casting cross-element skills.
   - **Forbidden Opposite Element**: Combatants are strictly barred from learning skills of their opposing cycle element:
     - Earth cannot learn Wind.
     - Water cannot learn Earth.
     - Fire cannot learn Water.
     - Wind cannot learn Fire.

3. **Learning & Forgetting**:
   - Using a Skill Tome from the Inventory opens a target slot prompt.
   - Signature slots cannot be replaced.
   - Flexible slots can be overwritten at will.

4. **Combat Resolution**:
   - Selecting "Skill" in combat presents the 5 equipped slots of the acting unit with effective SP costs and element badges.
   - Action resolution validates SP, executes the skill, and rolls damage/effects.

## Consequences

- Champions retain unique identities through Signature Skills while offering deep customization.
- Preserves elemental rock-paper-scissors without allowing game-breaking homogeneous builds.
- Cleanly isolated in `@poktsonline/shared/src/skills/` without bloating `BattleScene.ts` or violating ADR 0020.
