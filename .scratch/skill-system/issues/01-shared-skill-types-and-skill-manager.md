# Issue 01: Shared Skill Types, Catalog, and SkillManager Deep Module

## Status: open

## Blocked By: None

## Description

Define 5-slot skill structures, starter signature skills for champions, and `SkillManager` deep module with elemental affinity rules (STAB, SP surcharge, forbidden opposite element, learn/forget).

## Tasks

1. Update `packages/shared/src/types.ts`:
   - Add `CombatantSkillSlot` and update `Combatant` with `skillSlots?: CombatantSkillSlot[]`.
   - Update `CombatAction` to include `skillId?: string`.
2. Expand `packages/shared/src/data/skills.ts`:
   - Add Signature skills for starters (Lu Bu, Sasaki Kojiro, Adam, Thor) and elemental learnable skills.
3. Create `packages/shared/src/skills/skill-manager.ts` (max 400 lines):
   - `isForbiddenOppositeElement(entityElem, skillElem)`
   - `getEffectiveSkillCost(combatant, skill)`
   - `getEffectiveMultiplier(combatant, skill)`
   - `canLearnSkill(combatant, skillId, slotIndex)`
   - `learnSkill(combatant, skillId, slotIndex)`
   - `forgetSkill(combatant, slotIndex)`
   - `getStarterSkills(championId, element)`
4. Unit tests in `packages/shared/test/skills.test.ts`.
