# Issue 04: Client Skill Tree Modal Controller and HUD

## Description

Build the interactive Skill Tree UI Modal as a dedicated deep module `SkillTreeModalController`, wire an external button `#btn-skill-tree` to the header, and integrate with `OverworldScene`.

## Tasks

- [x] In `packages/client/index.html`:
  - Add `#btn-skill-tree` ("🌳 ทรีสกิล") to the external header navigation bar.
  - Add `#skill-tree-modal` container with backdrop, header, content panel, and close buttons.
- [x] In `packages/client/src/ui/SkillTreeModalController.ts`:
  - Encapsulate all DOM manipulation, branch rendering, node states (locked, unlockable, learned), point badges, and equip handlers.
  - Stay strictly <= 400 lines (Anti-God-Files rule).
- [x] In `packages/client/src/ui/styles.ts` or modern CSS:
  - Add clean styling for tree nodes, branches, badges, glowing unlockable borders, and equip modals.
- [x] In `packages/client/src/scenes/OverworldScene.ts`:
  - Instantiate and wire `SkillTreeModalController` into `setupUIControllers`, modal close loops, and hero sync callbacks.
  - Maintain Boy Scout Rule: `OverworldScene.ts` must stay <= 1901 lines.
- [x] Write unit tests in `packages/client/test/skill-tree-ui.test.ts`.

## Verification

- [x] All client tests pass: `npm run test -w @poktsonline/client`.
- [x] `npm run check:god-files` passes without warning.
