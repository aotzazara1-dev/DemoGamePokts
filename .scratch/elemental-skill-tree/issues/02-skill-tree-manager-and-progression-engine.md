# Issue 02: Skill Tree Manager and Progression Engine

## Description

Implement the domain logic for checking unlock requirements, learning skills, auto-equipping, assigning to slots, and granting skill points on level up.

## Tasks

- [ ] In `packages/shared/src/skills/skill-tree-manager.ts`:
  - `SkillTreeManager.canUnlockSkill(hero: Combatant, skillId: string): { canUnlock: boolean; reason?: string }`
  - `SkillTreeManager.unlockSkill(hero: Combatant, skillId: string): { success: boolean; hero: Combatant; reason?: string }`
  - `SkillTreeManager.equipSkillToSlot(hero: Combatant, skillId: string, slotIndex: number): { success: boolean; hero: Combatant; reason?: string }`
  - `SkillTreeManager.unequipSkillSlot(hero: Combatant, slotIndex: number): { success: boolean; hero: Combatant; reason?: string }`
  - `SkillTreeManager.ensureHeroSkillTreeState(hero: Combatant): Combatant`
- [ ] In `packages/shared/src/progression/progression-engine.ts`:
  - Update `addExpToCombatant` so that when a Hero levels up, they also gain `+1 skillPoints` per level (`statPointsGained` and `skillPointsGained`).
  - Update `LevelUpResult` interface to include `skillPointsGained: number`.
- [ ] Export `SkillTreeManager` in `packages/shared/src/index.ts`.
- [ ] Write unit tests in `packages/shared/test/skill-tree-manager.test.ts`.

## Verification

- Unit tests pass with 100% coverage on unlock rules, prerequisite validation, and slot assignment.
