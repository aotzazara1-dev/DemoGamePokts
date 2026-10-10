# Issue 01: Shared Elemental Skill Tree Catalog and Types

## Description

Define domain models, interfaces, and the complete 2-branch Skill Tree catalog for all 4 elements (Earth, Water, Fire, Wind) containing 7 skills per element (Branch A 3 tiers, Branch B 3 tiers, 1 Ultimate capstone).

## Tasks

- [ ] In `packages/shared/src/types.ts`:
  - Add `skillPoints?: number;` and `unlockedSkillIds?: string[];` to `Combatant`.
  - Define `SkillTreeNode`, `SkillTreeBranch`, and `ElementalSkillTreeConfig`.
- [ ] In `packages/shared/src/data/skills.ts`:
  - Register any missing skills for all 4 elemental branches (such as `skill_stone_wall`, `skill_clay_regeneration`, `skill_earth_splitter`, `skill_ultimate_gaia_wrath`, `skill_purifying_wave`, `skill_ocean_revival`, `skill_glacial_spike`, `skill_ultimate_poseidon_deluge`, `skill_crimson_lotus`, `skill_fireball`, `skill_dragon_breath`, `skill_ultimate_surtr_conflagration`, `skill_shadow_evasion`, `skill_tempest_celerity`, `skill_sky_rending_strike`, `skill_ultimate_odin_tempest`).
- [ ] In `packages/shared/src/data/skill-trees.ts`:
  - Create the configuration mapping for `ELEMENTAL_SKILL_TREES` for Earth, Water, Fire, Wind.
  - Export helper functions `getElementalSkillTree(element: Element): ElementalSkillTreeConfig`.
- [ ] Export new types and functions in `packages/shared/src/index.ts`.
- [ ] Write unit tests in `packages/shared/test/skill-tree-catalog.test.ts`.

## Verification

- `npm run test -w @poktsonline/shared` passes.
- Anti-God-Files check passes (`npm run check:god-files`).
