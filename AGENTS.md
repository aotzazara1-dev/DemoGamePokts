# AGENTS.md

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles mapped in `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout using `GLOSSARY.md` and `docs/adr/`. See `docs/agents/domain.md`.

## Key Navigation Pointers

- **Isometric Math & Projections**: `packages/client/src/utils/isometric.ts` (Use `IsometricGrid` or `IsometricConfig` object).
- **Client DOM Modals**: `packages/client/src/ui/` (Decoupled modal controllers: Auth, CharacterSelect, Inventory, Roster, Character, Shop, Dialogue).
- **Server Persistence & Repos**: `packages/server/src/db/` (WebAssembly SQLite `DatabaseEngine`, `AccountRepository`, `HeroRepository`).
- **Colyseus Room Authority**: `packages/server/src/rooms/` (`OverworldRoom`, `BattleRoom`).
- **Shared Data & Types**: `packages/shared/src/` (Combat formulas, progression, inventory, map configs).

## Codebase Navigation & Knowledge Graph (Mandatory Graphify-First)

- **GRAPHIFY-FIRST IS MANDATORY**: Before exploring the codebase, planning an architecture change, or investigating where a symbol/feature lives, agents **MUST FIRST** execute:
  - `graphify query "<topic or question>"` (CLI) or `query_graph` (MCP) for scoped subgraphs.
  - `graphify explain "<concept>"` or `get_node` for focused definitions and relationships.
  - `graphify path "<A>" "<B>"` for connection analysis.
- **NO BLIND SEARCHES**: Do NOT execute blind recursive directory searches or arbitrary grep before querying the graphify knowledge graph.
- **MAINTAIN GRAPH FRESHNESS**: After modifying code files in any session, agents **MUST** run `graphify update .` (AST-only, no API cost).

## Anti-God-Files Architecture & Deep Module Guardrails (ADR 0020)

- **Tiered LOC Ceilings**:
  - `UI Controller / Repository / Service / Manager`: Maximum **400 lines**.
  - `Game Scene / Canvas & Isometric Renderer`: Maximum **600 lines**.
  - `Data Catalog / Math Formulas / Domain Types`: Maximum **400 lines** (split into sub-catalogs if larger).
- **Single Responsibility Principle (SRP)**:
  - Never conflate multiple orthogonal domains in a single class/file (e.g. Scene lifecycle + Socket networking + DOM modals + Audio synthesis).
  - Extract deep sub-controllers, adapters, or managers behind narrow interfaces at clean seams.
- **Legacy Whitelist & Boy Scout Rule (Only Shrink)**:
  - Legacy files (`OverworldScene.ts`, `BattleScene.ts`, `OverworldRenderer.ts`, `OverworldRoom.ts`, `InventoryModalController.ts`) are capped at their current line counts.
  - **Whitelisted files must NEVER grow in line count.** Any new feature must be extracted into a dedicated deep module.
- **Automated Verification**:
  - Run `npm run check:god-files` (enforced on pre-commit and CI via `npm run check`).
