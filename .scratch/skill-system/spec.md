# Specification: 5-Slot Skill System, Signature Skills, and Elemental Affinity

## 1. Overview

Implement a tactical 5-slot skill architecture for both the Hero and Roster Champions inspired by TS Online 2x5 combat and Pokémon skill inheritance mechanics:

- Every unit has 5 skill slots.
- Champions possess 1-3 immutable **Signature Skills** (สกิลซิกเนเจอร์) that define their character identity and rarity.
- Remaining flexible slots can learn new skills from **Skill Tomes** (`item_tome_*`).
- Elemental balance mechanics (STAB + Cross-Element Penalty + SP Surcharge + Forbidden Opposite Element).
- In combat, players choose from the acting unit's configured skill slots with SP validation.

## 2. Detailed Architecture

### 2.1 Shared Data & Types (`@poktsonline/shared`)

- `CombatantSkillSlot`:
  - `slotIndex: number` (0..4)
  - `skillId: string | null`
  - `isSignature: boolean`
- `SkillDefinition`:
  - `id: string`
  - `name: string`
  - `element: Element | 'neutral'`
  - `spCost: number`
  - `multiplier: number`
  - `category: 'attack' | 'heal' | 'buff' | 'utility'`
  - `description: string`
- `SkillManager`:
  - Deep module under 400 LOC in `packages/shared/src/skills/skill-manager.ts`.
  - `canLearnSkill(combatant, skillId, slotIndex)`
  - `learnSkill(combatant, skillId, slotIndex)`
  - `forgetSkill(combatant, slotIndex)`
  - `isForbiddenOppositeElement(combatantElement, skillElement)`
  - `calculateSkillCost(combatant, skill)` (+50% if cross-element)
  - `calculateSkillDamage(attacker, defender, skill)` (STAB 1.25x if native element, 0.8x if cross-element)
- `Skill Tomes` in `packages/shared/src/inventory/item-database.ts`.

### 2.2 Battle Engine Integration (`packages/shared/src/battle/battle-engine.ts`)

- `CombatAction` supports `skillId`.
- Turn resolution deducts calculated SP, validates SP availability (falls back to regular attack if insufficient SP), applies STAB / elemental multiplier, and generates descriptive combat event log messages.

### 2.3 Client UI Presentation (`@poktsonline/client`)

- In `RosterModalController`: display the 5 skill slots of the selected Champion with signature badges and tooltips.
- In `BattleScene`: extract `BattleSkillMenuController` (< 400 LOC) to display available skill slots when selecting "Skill", enabling 1-click selection and target assignment without growing `BattleScene.ts`.
