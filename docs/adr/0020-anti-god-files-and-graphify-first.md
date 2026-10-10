# 20. Anti-God Files Architecture and Mandatory Graphify-First Navigation

Date: 2026-10-10

## Status

Accepted

## Context

As Poktsonline expanded across multiple milestones (multi-map, roaming beasts, persistence, chat, inventory, and equipment), certain orchestrator files expanded rapidly:

- `packages/client/src/scenes/OverworldScene.ts` grew to 1,742 lines, handling Phaser lifecycle, raw DOM modal management, keyboard input, Colyseus room networking, audio, and combat transitions.
- `packages/client/src/scenes/BattleScene.ts` grew to 1,121 lines.
- `packages/client/src/renderer/OverworldRenderer.ts` reached 919 lines.

Additionally, AI coding agents sometimes bypassed the repository's `graphify` knowledge graph, resorting to blind directory searches or raw grep, missing architectural seams and tacking new code onto existing monolithic files.

## Decision

1. **Mandatory Graphify-First Rule**:
   - Before exploring the codebase, planning an architecture change, or investigating a feature seam, agents **MUST** first execute `graphify query "<query>"` or `graphify explain "<concept>"`.
   - Blind recursive directory scans or arbitrary regex searching without consulting the knowledge graph is prohibited.
   - After modifying code files in any session, agents **MUST** execute `graphify update .` to keep graph nodes and edges synchronized.

2. **Tiered LOC Ceilings (Anti-God File Standards)**:
   - **UI Controllers, Repositories, Services, Managers**: Maximum **400 lines**.
   - **Game Scenes, Canvas/Isometric Renderers**: Maximum **600 lines**.
   - **Data Catalogs, Math Formulas, Domain Types**: Maximum **400 lines** (larger catalogs must be decomposed into modular files).
   - **Single Responsibility Principle (SRP)**: No single class may conflate orthogonal responsibilities (e.g. Scene lifecycle + Socket networking + DOM modals + Audio synthesis). Each responsibility must be delegated to a deep sub-controller or adapter behind a clean seam.

3. **Legacy Whitelist & Boy Scout Rule (Only Shrink)**:
   - Pre-existing files currently exceeding the ceilings are explicitly whitelisted with their baseline line cap:
     - `packages/client/src/scenes/OverworldScene.ts` (cap: 1,901)
     - `packages/client/src/scenes/BattleScene.ts` (cap: 1,290)
     - `packages/client/src/renderer/OverworldRenderer.ts` (cap: 979)
     - `packages/server/src/rooms/OverworldRoom.ts` (cap: 686)
     - `packages/client/src/ui/InventoryModalController.ts` (cap: 686)
     - `packages/client/src/entities/OverworldEntityManager.ts` (cap: 659)
     - `packages/server/src/db/HeroRepository.ts` (cap: 482)
     - `packages/client/src/ui/DebugToolbarController.ts` (cap: 447)
     - `packages/shared/src/inventory/item-database.ts` (cap: 425)
     - `packages/shared/src/battle/battle-engine.ts` (cap: 405)
   - **Boy Scout Rule**: Any change to a whitelisted file must NEVER increase its line count. Whitelisted files may only shrink as deep seams are extracted.
   - Any new file or unlisted file that exceeds its category ceiling fails validation.

4. **Deterministic Automated Guardrail**:
   - Script `scripts/check-god-files.mjs` enforces ceilings and whitelist line caps.
   - Wired to `npm run check:god-files` and integrated into `npm run check` and Husky pre-commit hooks.

## Consequences

- Prevents God Files and monolithic classes from forming in future features.
- Encourages deep modules with high cohesion and small interfaces.
- Protects context efficiency by mandating graph-first navigation.
